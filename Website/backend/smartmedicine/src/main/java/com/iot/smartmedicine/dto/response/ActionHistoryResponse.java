package com.iot.smartmedicine.dto.response;

import java.time.LocalDateTime;

import com.iot.smartmedicine.common.ActionStatus;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class ActionHistoryResponse {
    private String id;
    private String deviceId;
    private String deviceName;
    private ActionStatus status;
    private LocalDateTime time;
}
