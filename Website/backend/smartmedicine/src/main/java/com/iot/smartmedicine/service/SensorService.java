package com.iot.smartmedicine.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.iot.smartmedicine.common.SensorDataType;
import com.iot.smartmedicine.common.WarningLevel;
import com.iot.smartmedicine.dto.response.DataSensorResponse;
import com.iot.smartmedicine.dto.response.PageResponse;
import com.iot.smartmedicine.dto.response.SensorChartResponse;
import com.iot.smartmedicine.dto.response.SensorRealtimeResponse;
import com.iot.smartmedicine.entity.DataSensor;
import com.iot.smartmedicine.repository.DataSensorRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class SensorService {

    private final DataSensorRepository dataSensorRepository;
    private final MqttService mqttService;

    public SensorRealtimeResponse getLatestData() {
        DataSensor temperatureRecord = dataSensorRepository.findTopBySensor_DataTypeOrderByTimeDesc(SensorDataType.temperature).orElse(null);

        DataSensor humidityRecord = dataSensorRepository.findTopBySensor_DataTypeOrderByTimeDesc(SensorDataType.humidity).orElse(null);

        DataSensor lightRecord = dataSensorRepository.findTopBySensor_DataTypeOrderByTimeDesc(SensorDataType.light).orElse(null);

        LocalDateTime latestTime = null;
        if(temperatureRecord != null) {
            latestTime = temperatureRecord.getTime();
        }
        if(humidityRecord != null && (latestTime == null || humidityRecord.getTime().isAfter(latestTime))) {
            latestTime = humidityRecord.getTime();
        }
        if(lightRecord != null && (latestTime == null || lightRecord.getTime().isAfter(latestTime))) {
            latestTime = lightRecord.getTime();
        }


        SensorRealtimeResponse response = SensorRealtimeResponse.builder()
            // Nhiệt độ
            .temperature(temperatureRecord != null ? temperatureRecord.getValue() : null)
            .tempWarning(temperatureRecord != null ? temperatureRecord.getWarningLevel() : WarningLevel.SAFE)
            .tempUnit(temperatureRecord != null ? temperatureRecord.getUnit() : "°C")
            // Độ ẩm
            .humidity(humidityRecord != null ? humidityRecord.getValue() : null)
            .humidityWarning(humidityRecord != null ? humidityRecord.getWarningLevel() : WarningLevel.SAFE)
            .humidityUnit(humidityRecord != null ? humidityRecord.getUnit() : "%")
            // Ánh sáng
            .light(lightRecord != null ? lightRecord.getValue() : null)
            .lightWarning(lightRecord != null ? lightRecord.getWarningLevel() : WarningLevel.SAFE)
            .lightUnit(lightRecord != null ? lightRecord.getUnit() : "Lux")
            // Thời gian cập nhật cuối
            .time(latestTime)
            .build();

        return response;
    }

    public PageResponse<DataSensorResponse> getDataSensors(String dataType, String sort, int page, int size) {
        Sort pageSort = Sort.by("time").descending();

        if("asc".equalsIgnoreCase(sort)) {
            pageSort = Sort.by("time").ascending();
        }

        Pageable pageable = PageRequest.of(page - 1, size, pageSort);

        SensorDataType sensorDataType = null;
        if(dataType != null && !dataType.isBlank()) {
            try {
                sensorDataType = SensorDataType.valueOf(dataType.trim().toLowerCase());
            } catch (Exception e) { }
        }

        Page<DataSensor> dataSensorPage = dataSensorRepository.findAllWithFilter(sensorDataType, pageable);

        List<DataSensor> dataSensors = dataSensorPage.getContent();

        List<DataSensorResponse> response = dataSensors.stream()
            .map(dataSensor -> DataSensorResponse.builder()
                    .id(dataSensor.getId())
                    .dataType(dataSensor.getSensor().getDataType())
                    .value(dataSensor.getValue())
                    .unit(dataSensor.getUnit())
                    .warningLevel(dataSensor.getWarningLevel())
                    .time(dataSensor.getTime())
                    .build()
            ).toList();

        return PageResponse.<DataSensorResponse>builder()
            .currentPage(page)
            .pageSize(size)
            .totalPages(dataSensorPage.getTotalPages())
            .totalElements(dataSensorPage.getTotalElements())
            .content(response)
            .build();
    }

    public List<SensorChartResponse> getChartData() {
        List<DataSensor> temperatureList = dataSensorRepository.findTop20BySensor_DataTypeOrderByTimeDesc(SensorDataType.temperature);

        List<DataSensor> humidityList = dataSensorRepository.findTop20BySensor_DataTypeOrderByTimeDesc(SensorDataType.humidity);

        List<DataSensor> lightList = dataSensorRepository.findTop20BySensor_DataTypeOrderByTimeDesc(SensorDataType.light);

        int size = Math.min(temperatureList.size(), Math.min(humidityList.size(), lightList.size()));
        List<SensorChartResponse> chartList = new ArrayList<>();

        for(int i=0; i<size; i++) {
            chartList.add(SensorChartResponse.builder()
                .temperature(temperatureList.get(i).getValue())
                .humidity(humidityList.get(i).getValue())
                .light(lightList.get(i).getValue())
                .time(temperatureList.get(i).getTime())
                .build()
            );
        }

        //đảo ngược danh sách
        Collections.reverse(chartList);

        return chartList;
    }
}
