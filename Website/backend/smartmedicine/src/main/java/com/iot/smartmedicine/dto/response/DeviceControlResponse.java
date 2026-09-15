package com.iot.smartmedicine.dto.response;

import java.time.LocalDateTime;

import com.iot.smartmedicine.common.ActionStatus;
import com.iot.smartmedicine.common.DeviceStatus;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class DeviceControlResponse {
    private Long actionId;
    private String deviceId;
    private String deviceName;
    private DeviceStatus currentDeviceStatus;
    private String commandAction;
    private ActionStatus status;
    private LocalDateTime executedAt;
}
