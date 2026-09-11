package com.iot.smartmedicine.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iot.smartmedicine.dto.response.ApiResponse;
import com.iot.smartmedicine.dto.response.DataSensorResponse;
import com.iot.smartmedicine.dto.response.PageResponse;
import com.iot.smartmedicine.dto.response.SensorChartResponse;
import com.iot.smartmedicine.dto.response.SensorRealtimeResponse;
import com.iot.smartmedicine.service.SensorService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;


@RestController 
@RequestMapping ("/api/data-sensor")
@RequiredArgsConstructor 
public class SensorController {

    private final SensorService sensorService;

    @GetMapping ("/latest")
    public ApiResponse<SensorRealtimeResponse> getLatestData() {
        SensorRealtimeResponse data = sensorService.getLatestData();

        return ApiResponse.success(data, "Lấy dữ liệu mới nhất thành công");
    }

    @GetMapping("/chart")
    public ApiResponse<List<SensorChartResponse>> getChartData() {
        List<SensorChartResponse> data = sensorService.getChartData();

        return ApiResponse.success(data, "Lấy dữ liệu biểu đồ thành công");
    }
    
    @GetMapping()
    public ApiResponse<PageResponse<DataSensorResponse>> getDataSensors(
        @RequestParam(required = false, defaultValue = "all") String type,
        @RequestParam(required = false, defaultValue = "1") int page,
        @RequestParam(required = false, defaultValue = "10") int size,
        @RequestParam(required = false, defaultValue = "desc") String sort
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        PageResponse<DataSensorResponse> data = sensorService.getDataSensors(type, safePage, safeSize, sort);

        return ApiResponse.success(data, "Lấy lịch sử dữ liệu cảm biến thành công");
    }
    
}
