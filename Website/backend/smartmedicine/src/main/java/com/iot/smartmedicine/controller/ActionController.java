package com.iot.smartmedicine.controller;

import java.time.LocalDate;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iot.smartmedicine.dto.response.ActionHistoryResponse;
import com.iot.smartmedicine.dto.response.ApiResponse;
import com.iot.smartmedicine.dto.response.PageResponse;
import com.iot.smartmedicine.service.ActionService;

import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController 
@RequestMapping ("/api/actions")
@RequiredArgsConstructor 
public class ActionController {
    private final ActionService actionService;

    @GetMapping
    public ApiResponse<PageResponse<ActionHistoryResponse>> getActionHistory(
        @RequestParam (required = false, defaultValue = "ALL") String deviceId,
        @RequestParam (required = false, defaultValue = "ALL") String action,
        @RequestParam (required = false, defaultValue = "ALL") String status,
        @RequestParam (required = false) @DateTimeFormat (iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam (required = false, defaultValue = "1") int page,
        @RequestParam (required = false, defaultValue = "10") int size,
        @RequestParam (required = false, defaultValue = "desc") String sort
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        PageResponse<ActionHistoryResponse> response = actionService.getActionHistory(deviceId, action, status, date, safePage, safeSize, sort);

        return ApiResponse.success(response, "Lấy lịch sử hoạt động thiết bị thành công");
    }
    
}
