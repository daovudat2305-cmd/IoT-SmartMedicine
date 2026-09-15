package com.iot.smartmedicine.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
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

    @JsonFormat (pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime time;
}
