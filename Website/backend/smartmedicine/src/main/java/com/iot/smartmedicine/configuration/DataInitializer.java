package com.iot.smartmedicine.configuration;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.iot.smartmedicine.entity.User;
import com.iot.smartmedicine.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration 
@RequiredArgsConstructor 
@Slf4j 
public class DataInitializer {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initDefaultUser() {
        return args -> {
            String defaultEmail = "daovudat2305@gmail.com";
            if (userRepository.findByEmail(defaultEmail).isEmpty()) {
                User defaultUser = User.builder()
                        .email(defaultEmail)
                        .fullname("Đào Vũ Đạt")
                        .password(passwordEncoder.encode("12345678")) 
                        .github("#")
                        .figma("#")
                        .docs("#")
                        .apiDocs("#")
                        .build();
                userRepository.save(defaultUser);
                log.info("Khoi tao user mac dinh thanh cong: {}", defaultEmail);
            } else {
                log.info("User mac dinh da ton tai trong Database.");
            }
        };
    }

}
