package com.iot.smartmedicine.controller;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iot.smartmedicine.dto.request.DeviceControlRequest;
import com.iot.smartmedicine.dto.response.ApiResponse;
import com.iot.smartmedicine.dto.response.DeviceControlResponse;
import com.iot.smartmedicine.dto.response.DeviceResponse;
import com.iot.smartmedicine.service.DeviceService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;



@RestController 
@RequestMapping ("/api/devices")
@RequiredArgsConstructor 
public class DeviceController {
    
    private final DeviceService deviceService;

    @GetMapping
    public ApiResponse<List<DeviceResponse>> getAllDevices() {
        List<DeviceResponse> response = deviceService.getAllDevices();
        return ApiResponse.success(response, "Lấy dữ liệu tất cả thiết bị thành công");
    }

    @GetMapping("/{deviceId}")
    public ApiResponse<DeviceResponse> getDeviceById(@PathVariable("deviceId") String deviceId) {
        DeviceResponse response = deviceService.getDeviceById(deviceId);

        return ApiResponse.success(response, "Lấy thông tin thiết bị thành công");
    }
    
    

    @PostMapping("/{deviceId}/control")
    public CompletableFuture<ApiResponse<DeviceControlResponse>> controlDevice(
        @PathVariable("deviceId") String deviceId,
        @RequestBody DeviceControlRequest request
    ) {
        
        return deviceService.sendControlToDevice(deviceId, request)
            .thenApply(response -> ApiResponse.<DeviceControlResponse>success(response, "Điều khiển thiết bị thành công"));
    }
    
}
