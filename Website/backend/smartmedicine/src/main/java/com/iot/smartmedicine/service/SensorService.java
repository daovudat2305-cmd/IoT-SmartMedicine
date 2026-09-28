package com.iot.smartmedicine.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional (readOnly = true)
    public PageResponse<DataSensorResponse> getDataSensors(String dataType, String search, int page, int size, String sort) {
        Sort pageSort = Sort.by("time").descending();

        if("asc".equalsIgnoreCase(sort)) {
            pageSort = Sort.by("time").ascending();
        }

        Pageable pageable = PageRequest.of(page - 1, size, pageSort);

        SensorDataType sensorDataType = null;
        if (dataType != null && !dataType.isBlank() && !"all".equalsIgnoreCase(dataType.trim())) {
            try {
                sensorDataType = SensorDataType.valueOf(dataType.trim().toLowerCase());
            } catch (Exception e) { }
        }

        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        //tìm kiếm
        Page<DataSensor> dataSensorPage = dataSensorRepository.findAllWithFilter(sensorDataType, cleanSearch, pageable);

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
        // Lấy tối đa 60 bản ghi gần nhất (20 mốc × 3 loại)
        List<DataSensor> allRecent = dataSensorRepository
            .findTop60ForChart(PageRequest.of(0, 60));
        // Nhóm theo thời gian (LocalDateTime) — key là mốc thời gian
        Map<LocalDateTime, Map<SensorDataType, BigDecimal>> grouped = new LinkedHashMap<>();
        for (DataSensor ds : allRecent) {
            grouped
                .computeIfAbsent(ds.getTime(), k -> new EnumMap<>(SensorDataType.class))
                .put(ds.getSensor().getDataType(), ds.getValue());
        }

        // Chỉ lấy các mốc thời gian có đủ cả 3 loại
        List<SensorChartResponse> chartList = grouped.entrySet().stream()
            .filter(e -> e.getValue().containsKey(SensorDataType.temperature)
                    && e.getValue().containsKey(SensorDataType.humidity)
                    && e.getValue().containsKey(SensorDataType.light))
            .limit(20)
            .map(e -> SensorChartResponse.builder()
                .temperature(e.getValue().get(SensorDataType.temperature))
                .humidity(e.getValue().get(SensorDataType.humidity))
                .light(e.getValue().get(SensorDataType.light))
                .time(e.getKey())
                .build())
            .collect(Collectors.toList());

        //đảo ngược danh sách
        Collections.reverse(chartList);

        return chartList;
    }
}
