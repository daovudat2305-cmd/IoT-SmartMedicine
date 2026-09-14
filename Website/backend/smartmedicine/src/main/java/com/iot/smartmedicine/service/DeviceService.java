package com.iot.smartmedicine.service;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.iot.smartmedicine.common.ActionStatus;
import com.iot.smartmedicine.dto.request.DeviceControlRequest;
import com.iot.smartmedicine.entity.Action;
import com.iot.smartmedicine.entity.Device;
import com.iot.smartmedicine.exception.AppException;
import com.iot.smartmedicine.exception.ErrorCode;
import com.iot.smartmedicine.repository.ActionRepository;
import com.iot.smartmedicine.repository.DeviceRepository;

import jakarta.transaction.Transactional;
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

    public void sendControlToDevice(String deviceId, DeviceControlRequest request) {
        Device device = deviceRepository.findById(deviceId)
            .orElseThrow(() -> new AppException(ErrorCode.DEVICE_NOT_FOUND));

        Action action = Action.builder()
            .device(device)
            .action(request.getAction())
            .status(ActionStatus.pending)
            .time(LocalDateTime.now())
            .build();
        
        actionRepository.save(action);

        CompletableFuture<Boolean> future = new CompletableFuture<Boolean>()
            .orTimeout(5, TimeUnit.SECONDS);

        future.whenComplete((result, ex) -> {
            pendingControls.remove(deviceId);
            if(ex != null) {
                log.warn("Thiết bị {} không phản hồi hoặc lỗi: {}", deviceId, ex.getMessage());
                action.setStatus(ActionStatus.failed);
            }
            else {
                action.setStatus(Boolean.TRUE.equals(result) ? ActionStatus.success : ActionStatus.failed);
            }

            actionRepository.save(action);
        });

        pendingControls.put(deviceId, future);

        //publish lệnh xuống MQTT
        String topic = deviceControlTopic + "/" + deviceId;
        String payload = String.format("{\"action\":\"%s\"}", request.getAction());

        mqttService.publishMessage(topic, payload);
        log.info("Đã gửi lệnh điều khiển tới thiết bị {}: {}", deviceId, payload);
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
