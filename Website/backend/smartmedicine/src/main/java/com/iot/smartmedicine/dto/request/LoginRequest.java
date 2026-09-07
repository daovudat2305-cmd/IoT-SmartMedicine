package com.iot.smartmedicine.dto.request;

import lombok.Getter;

@Getter 
public class LoginRequest {
    private String email;
    private String password;
}
