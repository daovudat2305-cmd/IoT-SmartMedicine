package com.iot.smartmedicine.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class SensorStatusResponse {
    private String status;       // ví dụ: "error", "ok"
    private String message;      // ví dụ: "sensor_failed
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime time;
}
