package com.iot.smartmedicine.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iot.smartmedicine.dto.request.LoginRequest;
import com.iot.smartmedicine.dto.response.ApiResponse;
import com.iot.smartmedicine.dto.response.LoginResponse;
import com.iot.smartmedicine.repository.UserRepository;
import com.iot.smartmedicine.service.AuthenticationService;

import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping ("/api/auth")
@RequiredArgsConstructor 
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping ("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authenticationService.login(request);
        return ApiResponse.success(response, "Đăng nhập thành công");
    }
}
