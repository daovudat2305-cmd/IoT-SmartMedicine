package com.iot.smartmedicine.dto.response;

import java.time.LocalDateTime;

import com.iot.smartmedicine.common.ActionStatus;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class ActionHistoryResponse {
    private Long id;
    private String deviceId;
    private String deviceName;
    private String action;
    private ActionStatus status;
    private LocalDateTime time;
}
