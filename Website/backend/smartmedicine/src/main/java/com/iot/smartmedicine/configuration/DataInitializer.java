package com.iot.smartmedicine.configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.iot.smartmedicine.common.DeviceStatus;
import com.iot.smartmedicine.common.SensorDataType;
import com.iot.smartmedicine.entity.Device;
import com.iot.smartmedicine.entity.Sensor;
import com.iot.smartmedicine.entity.User;
import com.iot.smartmedicine.repository.DeviceRepository;
import com.iot.smartmedicine.repository.SensorRepository;
import com.iot.smartmedicine.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration 
@RequiredArgsConstructor 
@Slf4j 
public class DataInitializer {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SensorRepository sensorRepository;
    private final DeviceRepository deviceRepository;

    @Bean
    public CommandLineRunner initDatabase() {
        return args -> {
            initDefaultUser();

            initSensors();

            initDevices();
        };
    }

    private void initDefaultUser() {
        String defaultEmail = "daovudat2305@gmail.com";
        if (userRepository.findByEmail(defaultEmail).isEmpty()) {
            User defaultUser = User.builder()
                    .email(defaultEmail)
                    .fullname("Đào Vũ Đạt")
                    .password(passwordEncoder.encode("12345678")) 
                    .github("https://github.com/daovudat2305-cmd/IoT-SmartMedicine.git")
                    .figma("https://www.figma.com/design/94c6AmnyR6lT7STOBCiEAu/IoT?node-id=0-1")
                    .docs("https://docs.google.com/document/d/1qIOQnBkG7CbFp9NUeo_Eo19hvopRM9KnJYZFAgV4SdI/edit?usp=sharing")
                    .apiDocs("https://docs.google.com/spreadsheets/d/10UtQFcamvfssBHPwCm3Xl5zW6l89ydFq3iFJkjyMs-Y/edit?usp=sharing")
                    .build();
            userRepository.save(defaultUser);
            log.info("Khoi tao user mac dinh thanh cong: {}", defaultEmail);
        } else {
            log.info("User mac dinh da ton tai trong Database.");
        }
    }

    private void initSensors() {
        if (sensorRepository.count() == 0) {
            List<Sensor> defaultSensors = List.of(
                Sensor.builder()
                    .id("temperature")
                    .name("Cảm biến nhiệt độ")
                    .dataType(SensorDataType.temperature)
                    .minThreshold(new BigDecimal("10.00"))
                    .maxThreshold(new BigDecimal("35.00"))
                    .unit("°C")
                    .build(),
                Sensor.builder()
                    .id("humidity")
                    .name("Cảm biến độ ẩm")
                    .dataType(SensorDataType.humidity)
                    .minThreshold(new BigDecimal("40.00"))
                    .maxThreshold(new BigDecimal("70.00"))
                    .unit("%")
                    .build(),
                Sensor.builder()
                    .id("light")
                    .name("Cảm biến ánh sáng")
                    .dataType(SensorDataType.light)
                    .minThreshold(new BigDecimal("0.00"))
                    .maxThreshold(new BigDecimal("1000.00"))
                    .unit("Lux")
                    .build()
            );
            sensorRepository.saveAll(defaultSensors);
            log.info("Da khoi tao thanh cong 3 cam bien mac dinh vao bang sensors.");
        } else {
            log.info("Bang sensors da co du lieu, bo qua seed.");
        }
    }

    private void initDevices() {
        if (deviceRepository.count() == 0) {
            LocalDateTime now = LocalDateTime.now();
            List<Device> defaultDevices = List.of(
                Device.builder()
                    .id("led1")
                    .name("Cảnh báo nhiệt độ (LED 1)")
                    .status(DeviceStatus.OFF)
                    .createdAt(now)
                    .updatedAt(now)
                    .build(),
                Device.builder()
                    .id("led2")
                    .name("Cảnh báo độ ẩm (LED 2)")
                    .status(DeviceStatus.OFF)
                    .createdAt(now)
                    .updatedAt(now)
                    .build(),
                Device.builder()
                    .id("led3")
                    .name("Cảnh báo ánh sáng (LED 3)")
                    .status(DeviceStatus.OFF)
                    .createdAt(now)
                    .updatedAt(now)
                    .build()
            );
            deviceRepository.saveAll(defaultDevices);
            log.info("Da khoi tao thanh cong 3 thiet bi (led1, led2, led3) vao bang devices.");
        } else {
            log.info("Bang devices da co du lieu, bo qua seed.");
        }
    }
}
