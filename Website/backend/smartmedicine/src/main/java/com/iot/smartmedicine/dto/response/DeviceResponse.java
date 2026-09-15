package com.iot.smartmedicine.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.iot.smartmedicine.common.DeviceStatus;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class DeviceResponse {
    private String id;
    private String name;
    private DeviceStatus status;

    @JsonFormat (pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat (pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
