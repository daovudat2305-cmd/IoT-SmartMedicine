package com.iot.smartmedicine.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.iot.smartmedicine.common.WarningLevel;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class SensorRealtimeResponse {
    private BigDecimal temperature;
    private WarningLevel tempWarning;
    private String tempUnit;

    private BigDecimal humidity;
    private WarningLevel humidityWarning;
    private String humidityUnit;

    private BigDecimal light;
    private WarningLevel lightWarning;
    private String lightUnit;

    @JsonFormat (pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime time;
}
