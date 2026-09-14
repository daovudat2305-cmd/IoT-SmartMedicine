package com.iot.smartmedicine.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.iot.smartmedicine.common.ActionStatus;
import com.iot.smartmedicine.dto.response.ActionHistoryResponse;
import com.iot.smartmedicine.dto.response.PageResponse;
import com.iot.smartmedicine.entity.Action;
import com.iot.smartmedicine.exception.AppException;
import com.iot.smartmedicine.exception.ErrorCode;
import com.iot.smartmedicine.repository.ActionRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class ActionService {

    private final ActionRepository actionRepository;

    @Transactional(readOnly = true)
    public PageResponse<ActionHistoryResponse> getActionHistory(
        String deviceId,
        String action,
        String status,
        LocalDate date,
        int page,
        int size,
        String sort
    ) {
        Sort pageSort = Sort.by("time").descending();

        if ("asc".equalsIgnoreCase(sort)) {
            pageSort = Sort.by("time").ascending();
        }

        Pageable pageable = PageRequest.of(page - 1, size, pageSort);

        ActionStatus actionStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                actionStatus = ActionStatus.valueOf(status.trim().toLowerCase());
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.INVALID_ACTION_STATUS);
            }
        }

        // chuyển LocalDate → đầu ngày / cuối ngày để lọc theo khoảng thời gian
        LocalDateTime startTime = (date != null) ? date.atStartOfDay() : null;
        LocalDateTime endTime   = (date != null) ? date.atTime(LocalTime.MAX) : null;

        Page<Action> actionPage = actionRepository.findAllWithFilters(
            deviceId, action, actionStatus, startTime, endTime, pageable
        );

        List<ActionHistoryResponse> response = actionPage.getContent().stream()
            .map(act -> ActionHistoryResponse.builder()
                    .id(act.getId())
                    .deviceId(act.getDevice().getId())
                    .deviceName(act.getDevice().getName())
                    .action(act.getAction())
                    .status(act.getStatus())
                    .time(act.getTime())
                    .build()
            ).toList();

        return PageResponse.<ActionHistoryResponse>builder()
            .currentPage(page)
            .pageSize(size)
            .totalPages(actionPage.getTotalPages())
            .totalElements(actionPage.getTotalElements())
            .content(response)
            .build();
    }
}
