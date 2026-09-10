package com.iot.smartmedicine.configuration;

import java.util.UUID;

import org.eclipse.paho.client.mqttv3.IMqttClient;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.extern.slf4j.Slf4j;

@Configuration 
@Slf4j 
public class MqttConfig {
    @Value("${mqtt.broker-url}")
    private String brokerUrl;

    @Value("${mqtt.client-id}")
    private String clientId;

    @Value("${mqtt.username:}")
    private String username;

    @Value("${mqtt.password:}")
    private String password;

    @Value("${mqtt.timeout:10}")
    private int connectionTimeout;
    
    @Value("${mqtt.keepalive:60}")
    private int keepAliveInterval;

    @Bean 
    public IMqttClient mqttClient() {
        try {
            // Nối thêm chuỗi ngẫu nhiên tránh xung đột Client ID khi restart server
            String uniqueClientId = clientId + "_" + UUID.randomUUID().toString().substring(0, 5);
            // Khởi tạo MqttClient với bộ nhớ tạm RAM (MemoryPersistence)
            IMqttClient client = new MqttClient(brokerUrl, uniqueClientId, new MemoryPersistence());

            // Thiết lập các thuộc tính kết nối
            MqttConnectOptions options = new MqttConnectOptions();
            options.setCleanSession(true);              // Xóa session cũ khi kết nối
            options.setAutomaticReconnect(true);        // Tự động kết nối lại nếu rớt mạng
            options.setConnectionTimeout(connectionTimeout);
            options.setKeepAliveInterval(keepAliveInterval);
            
            // Kiểm tra username/password nếu có
            if (username != null && !username.isBlank()) {
                options.setUserName(username);
            }
            if (password != null && !password.isBlank()) {
                options.setPassword(password.toCharArray());
            }
            log.info("Đang kết nối tới MQTT Broker: {}", brokerUrl);
            client.connect(options);
            log.info("Kết nối MQTT Broker thành công với Client ID: {}", uniqueClientId);
            return client;
        } catch (Exception e) {
            log.error("Lỗi khi kết nối MQTT Broker tại {}: {}", brokerUrl, e.getMessage());
            // Ném lỗi để thông báo nếu Broker chưa bật (Mosquitto chưa chạy)
            throw new RuntimeException("Không thể kết nối MQTT Broker: " + e.getMessage(), e);
        }
    }
}
