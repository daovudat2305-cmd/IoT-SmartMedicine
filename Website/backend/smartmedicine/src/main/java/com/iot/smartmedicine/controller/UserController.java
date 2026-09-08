package com.iot.smartmedicine.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iot.smartmedicine.dto.response.ApiResponse;
import com.iot.smartmedicine.dto.response.UserInfoResponse;
import com.iot.smartmedicine.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping ("/api/profile")
@RequiredArgsConstructor 
public class UserController {
    
    private final UserService userService;

    @GetMapping ("/me")
    public ApiResponse<UserInfoResponse> getMyInfo(Authentication authentication) {
        String email = authentication.getName();

        return ApiResponse.success(userService.getMyInfo(email), "Lấy thông tin user thành công");
    }
}
