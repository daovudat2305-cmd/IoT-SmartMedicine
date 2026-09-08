package com.iot.smartmedicine.service;

import org.springframework.stereotype.Service;

import com.iot.smartmedicine.dto.response.UserInfoResponse;
import com.iot.smartmedicine.entity.User;
import com.iot.smartmedicine.exception.AppException;
import com.iot.smartmedicine.exception.ErrorCode;
import com.iot.smartmedicine.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class UserService {
    private final UserRepository userRepository;

    public UserInfoResponse getMyInfo(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        return UserInfoResponse.builder()
            .fullName(user.getFullname())
            .email(user.getEmail())
            .docs(user.getDocs())
            .figma(user.getFigma())
            .github(user.getGithub())
            .apiDocs(user.getApiDocs())
            .build();
    }
}
