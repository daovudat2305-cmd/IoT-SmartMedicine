package com.iot.smartmedicine.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class SensorChartResponse {
    private BigDecimal temperature;
    private BigDecimal humidity;
    private BigDecimal light;

    @JsonFormat (pattern = "HH:mm:ss")
    private LocalDateTime time;
}
