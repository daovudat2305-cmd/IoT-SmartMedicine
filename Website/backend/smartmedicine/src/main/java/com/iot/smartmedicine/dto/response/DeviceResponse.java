package com.iot.smartmedicine.dto.response;

import java.time.LocalDateTime;

import com.iot.smartmedicine.common.DeviceStatus;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class DeviceResponse {
    private String id;
    private String name;
    private DeviceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime uploadedAt;
}
