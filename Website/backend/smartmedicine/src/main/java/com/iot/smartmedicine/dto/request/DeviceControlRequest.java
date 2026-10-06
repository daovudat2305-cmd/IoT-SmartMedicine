package com.iot.smartmedicine.dto.request;

import lombok.Data;

@Data
public class DeviceControlRequest {
    private String deviceId;
    private String action;
}
