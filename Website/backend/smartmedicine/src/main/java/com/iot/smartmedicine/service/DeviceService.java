package com.iot.smartmedicine.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.iot.smartmedicine.common.ActionStatus;
import com.iot.smartmedicine.common.DeviceStatus;
import com.iot.smartmedicine.dto.request.DeviceControlRequest;
import com.iot.smartmedicine.dto.response.DeviceControlResponse;
import com.iot.smartmedicine.dto.response.DeviceResponse;
import com.iot.smartmedicine.entity.Action;
import com.iot.smartmedicine.entity.Device;
import com.iot.smartmedicine.exception.AppException;
import com.iot.smartmedicine.exception.ErrorCode;
import com.iot.smartmedicine.repository.ActionRepository;
import com.iot.smartmedicine.repository.DeviceRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service 
@RequiredArgsConstructor 
@Slf4j 
public class DeviceService {

    private final ActionRepository actionRepository;
    private final DeviceRepository deviceRepository;
    private final MqttService mqttService;

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    private final ConcurrentHashMap<String, CompletableFuture<Boolean>> pendingControls = new ConcurrentHashMap<>();

    @Value ("${mqtt.topics.device-control:device_control}")
    private String deviceControlTopic;

    //lấy trạng thái thiết bị khi mới kết nối esp32
    @Transactional 
    public void syncAllDevicesStatus(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            List<DeviceResponse> updatedDevices = new ArrayList<>();

            node.properties().forEach(entry -> {
                String deviceId = entry.getKey();
                String statusStr = entry.getValue().asString();

                deviceRepository.findById(deviceId).ifPresent(device -> {
                    try {
                        device.setStatus(DeviceStatus.valueOf(statusStr.toUpperCase()));
                        device.setUpdatedAt(LocalDateTime.now());
                        deviceRepository.save(device);
                        updatedDevices.add(DeviceResponse.builder()
                            .id(device.getId())
                            .name(device.getName())
                            .status(device.getStatus())
                            .updatedAt(device.getUpdatedAt())
                            .build());
                    } catch (IllegalArgumentException e) {
                        log.warn("Trạng thái không hợp lệ '{}' từ ESP32 cho thiết bị '{}', bỏ qua.", statusStr, deviceId);
                    }
                });
            });

            //gửi tin qua websocket
            messagingTemplate.convertAndSend("/topic/device-status", updatedDevices);
            log.info("Đã đồng bộ trạng thái thiết bị từ phần cứng vào DB và đẩy qua WebSocket");
        } catch (Exception e) {
            log.error("Lỗi khi đồng bộ trạng thái thiết bị: {}", e.getMessage());
        }
    }


    //lấy trạng thái thiết bị
    public List<DeviceResponse> getAllDevices() {
        List<Device> devices = deviceRepository.findAll();

        return devices.stream()
            .map(device -> DeviceResponse.builder()
                        .id(device.getId())
                        .name(device.getName())
                        .status(device.getStatus())
                        .createdAt(device.getCreatedAt())
                        .updatedAt(device.getUpdatedAt())
                        .build()
            ).toList();
    }

    public DeviceResponse getDeviceById(String deviceId) {
        Device device = deviceRepository.findById(deviceId)
            .orElseThrow(() -> new AppException(ErrorCode.DEVICE_NOT_FOUND));

        return DeviceResponse.builder()
                .id(device.getId())
                .name(device.getName())
                .status(device.getStatus())
                .createdAt(device.getCreatedAt())
                .updatedAt(device.getUpdatedAt())
                .build();
    }

    //điều khiển thiết bị
    public CompletableFuture<DeviceControlResponse> sendControlToDevice(String deviceId, DeviceControlRequest request) {
        if(pendingControls.containsKey(deviceId) || pendingControls.containsKey("all")) {
            throw new AppException(ErrorCode.DEVICE_BUSY);
        }

        Device device = deviceRepository.findById(deviceId)
            .orElseThrow(() -> new AppException(ErrorCode.DEVICE_NOT_FOUND));

        String actionStr = request.getAction() != null ? request.getAction().trim().toUpperCase() : "";
        if(!actionStr.equals("ON") && !actionStr.equals("OFF")) {
            throw new AppException(ErrorCode.INVALID_ACTION_STATUS);
        }
        
        //lưu trạng thái pending
        Action action = Action.builder()
            .device(device)
            .action(actionStr)
            .status(ActionStatus.pending)
            .time(LocalDateTime.now())
            .build();
        
        actionRepository.save(action);

        //tạo CompletableFuture với timeout 5s chờ ESP32 phản hồi
        CompletableFuture<Boolean> future = new CompletableFuture<Boolean>()
            .orTimeout(5, TimeUnit.SECONDS);

        pendingControls.put(deviceId, future);

        //publish lệnh xuống MQTT
        String topic = deviceControlTopic + "/" + deviceId;
        String payload = String.format("{\"action\":\"%s\"}", actionStr);

        mqttService.publishMessage(topic, payload);
        log.info("Đã gửi lệnh điều khiển tới thiết bị {}: {}", deviceId, payload);

        return future.handle((success, exception) -> {
            pendingControls.remove(deviceId);

            if(exception != null || !Boolean.TRUE.equals(success)) {
                log.warn("Thiết bị {} không phản hồi hoặc thực thi lỗi", deviceId);
                action.setStatus(ActionStatus.failed);
                actionRepository.save(action);
                throw new AppException(ErrorCode.DEVICE_NOT_RESPONDING);
            }

            //Thành công
            //cập nhật trạng thái hành động
            action.setStatus(ActionStatus.success);
            actionRepository.save(action);

            //cập nhật trạng thái thiết bị
            device.setStatus(DeviceStatus.valueOf(actionStr));
            device.setUpdatedAt(LocalDateTime.now());
            deviceRepository.save(device);

            // gửi WebSocket khi điều khiển 1 thiết bị
            messagingTemplate.convertAndSend("/topic/device-status",
                DeviceResponse.builder()
                    .id(device.getId())
                    .name(device.getName())
                    .status(device.getStatus())
                    .updatedAt(device.getUpdatedAt())
                    .build()
            );

            //trả response
            return DeviceControlResponse.builder()
                .actionId(action.getId())
                .deviceId(device.getId())
                .deviceName(device.getName())
                .currentDeviceStatus(device.getStatus())
                .commandAction(actionStr)
                .status(ActionStatus.success)
                .executedAt(device.getUpdatedAt())
                .build();
        });
    }

    public void confirmDeviceResponse(String deviceId, boolean success) {
        CompletableFuture<Boolean> future = pendingControls.get(deviceId);
        if(future != null) {
            future.complete(success);
        } 
        else {
            log.warn("Nhận phản hồi từ thiết bị {} nhưng không tìm thấy pending request", deviceId);
        }
    }

    
    public CompletableFuture<List<DeviceControlResponse>> sendControlToAllDevices(DeviceControlRequest request) {
        if (request == null || request.getAction() == null) {
            throw new AppException(ErrorCode.INVALID_ACTION_STATUS);
        }
        String actStr = request.getAction().trim().toUpperCase();

        if(!actStr.equals("ON") && !actStr.equals("OFF")) {
            throw new AppException(ErrorCode.INVALID_ACTION_STATUS);
        }

        String controlKey = "all";
        if(!pendingControls.isEmpty()) {
            throw new AppException(ErrorCode.DEVICE_BUSY);
        }

        List<Device> allDevices = deviceRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        //tạo bản ghi action ở trạng thái pending
        List<Action> actions = allDevices.stream()
            .map(dev -> Action.builder()
                .device(dev)
                .action(actStr)
                .status(ActionStatus.pending)
                .time(now)
                .build())
            .toList();
        actionRepository.saveAll(actions);

        CompletableFuture<Boolean> future = new CompletableFuture<Boolean>().orTimeout(5, TimeUnit.SECONDS);
        pendingControls.put(controlKey, future);

        //publish lệnh xuống MQTT
        String topic = deviceControlTopic + "/" + controlKey;
        String payload = String.format("{\"action\":\"%s\"}", actStr);
        mqttService.publishMessage(topic, payload);
        log.info("Đã gửi lệnh điều khiển tới toàn bộ thiết bị: {}", payload);

        //xử lý kết quả trả về
        return future.handle((success, exception) -> {
            pendingControls.remove(controlKey);

            if(exception != null || !Boolean.TRUE.equals(success)) {
                log.warn("ESP32 không phản hồi hoặc thực thi lệnh điều khiển toàn bộ thất bại");
                actions.forEach(a -> a.setStatus(ActionStatus.failed));
                actionRepository.saveAll(actions);
                throw new AppException(ErrorCode.DEVICE_NOT_RESPONDING);
            }

            //Thành công
            //cập nhật trạng thái hành động
            actions.forEach(a -> a.setStatus(ActionStatus.success));
            actionRepository.saveAll(actions);

            List<DeviceResponse> socketUpdates = new ArrayList<>();
            List<DeviceControlResponse> responses = new ArrayList<>();

            for(int i = 0; i < allDevices.size(); i++) {
                Device device = allDevices.get(i);
                Action act = actions.get(i);
                device.setStatus(DeviceStatus.valueOf(actStr));
                device.setUpdatedAt(now);

                socketUpdates.add(DeviceResponse.builder()
                    .id(device.getId())
                    .name(device.getName())
                    .status(device.getStatus())
                    .updatedAt(device.getUpdatedAt())
                    .build());
                responses.add(DeviceControlResponse.builder()
                    .actionId(act.getId())
                    .deviceId(device.getId())
                    .deviceName(device.getName())
                    .currentDeviceStatus(device.getStatus())
                    .commandAction(actStr)
                    .status(ActionStatus.success)
                    .executedAt(device.getUpdatedAt())
                    .build());
            }
            deviceRepository.saveAll(allDevices);

            // Đẩy cập nhật realtime tới Frontend qua WebSocket
            messagingTemplate.convertAndSend("/topic/device-status", socketUpdates);
            return responses;
        });
    }
}
