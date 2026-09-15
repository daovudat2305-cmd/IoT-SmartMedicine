package com.iot.smartmedicine.controller;

import java.util.concurrent.CompletableFuture;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iot.smartmedicine.dto.request.DeviceControlRequest;
import com.iot.smartmedicine.dto.response.ApiResponse;
import com.iot.smartmedicine.dto.response.DeviceControlResponse;
import com.iot.smartmedicine.service.DeviceService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController 
@RequestMapping ("/api/devices")
@RequiredArgsConstructor 
public class DeviceController {
    
    private final DeviceService deviceService;

    @PostMapping("/{deviceId}/control")
    public CompletableFuture<ApiResponse<DeviceControlResponse>> controlDevice(
        @PathVariable String deviceId,
        @RequestBody DeviceControlRequest request
    ) {
        
        return deviceService.sendControlToDevice(deviceId, request)
            .thenApply(response -> ApiResponse.<DeviceControlResponse>success(response, "Điều khiển thiết bị thành công"));
    }
    
}
