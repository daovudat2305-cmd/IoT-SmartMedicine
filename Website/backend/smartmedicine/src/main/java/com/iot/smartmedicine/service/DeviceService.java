package com.iot.smartmedicine.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

@Service 
@RequiredArgsConstructor 
@Slf4j 
public class DeviceService {

    private final ActionRepository actionRepository;
    private final DeviceRepository deviceRepository;
    private final MqttService mqttService;

    private final ConcurrentHashMap<String, CompletableFuture<Boolean>> pendingControls = new ConcurrentHashMap<>();

    @Value ("${mqtt.topics.device-control:device_control}")
    private String deviceControlTopic;

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
        if(pendingControls.containsKey(deviceId)) {
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


}
