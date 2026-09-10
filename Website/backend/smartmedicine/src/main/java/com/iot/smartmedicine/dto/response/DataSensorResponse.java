package com.iot.smartmedicine.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.iot.smartmedicine.common.SensorDataType;
import com.iot.smartmedicine.common.WarningLevel;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class DataSensorResponse {
    private String id;
    private SensorDataType dataType;
    private BigDecimal value;
    private String unit;
    private WarningLevel warningLevel;

    @JsonFormat (pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime time;
}
