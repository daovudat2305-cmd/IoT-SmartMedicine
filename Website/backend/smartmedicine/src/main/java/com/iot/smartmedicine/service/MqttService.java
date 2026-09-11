package com.iot.smartmedicine.service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.eclipse.paho.client.mqttv3.IMqttClient;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.iot.smartmedicine.common.SensorDataType;
import com.iot.smartmedicine.common.WarningLevel;
import com.iot.smartmedicine.dto.response.SensorRealtimeResponse;
import com.iot.smartmedicine.entity.DataSensor;
import com.iot.smartmedicine.entity.Sensor;
import com.iot.smartmedicine.repository.DataSensorRepository;
import com.iot.smartmedicine.repository.SensorRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service 
@Slf4j 
@RequiredArgsConstructor 
public class MqttService {

    private final IMqttClient mqttClient;
    private final SensorRepository sensorRepository;
    private final DataSensorRepository dataSensorRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @Value ("${mqtt.topics.sensor-data:sensor_data}")
    private String sensorDataTopic;

    @Value("${mqtt.topics.device_response:device_control_resp}")
    private String deviceResponseTopic;

    //khởi tạo callback lắng nghe service
    @PostConstruct 
    public void init() {
        mqttClient.setCallback(new MqttCallbackExtended() {
            @Override
            public void connectComplete(boolean reconnect, String serverUrl) {
                log.info("Kết nối MQTT hoàn tất (reconnect: {}) tới: {}", reconnect, serverUrl);
                subscribeToTopics();
            }

            @Override
            public void connectionLost(Throwable cause) {
                log.warn("Mất kết nối MQTT Broker: {}", cause != null ? cause.getMessage() : "Không rõ nguyên nhân");
            }

            @Override
            public void messageArrived(String topic, MqttMessage message) throws Exception {
                handleIncomingMessage(topic, message);
                
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken arg0) {
                // TODO Auto-generated method stub
                
            }
        });

        if(mqttClient.isConnected()) {
            subscribeToTopics();
        }
    }

    //đăng ký topic
    private void subscribeToTopics() {
        try {
            mqttClient.subscribe(sensorDataTopic, 1);
            log.info("Đã subscribe topic sensor_data: {}", sensorDataTopic);

            mqttClient.subscribe(deviceResponseTopic, 1);
            log.info("Đã subscribe topic phản hồi thiết bị: {}", deviceResponseTopic);
        } catch (MqttException e) {
            log.error("Lỗi khi subscribe topic MQTT: {}", e.getMessage());
        }
    }

    //điều hướng xử lý tin nhắn theo topic
    private void handleIncomingMessage(String topic, MqttMessage message) {
        String payload = new String(message.getPayload(), StandardCharsets.UTF_8);
        log.info("Nhận tin từ topic [{}]: {}", topic, payload);

        if(topic.equals(sensorDataTopic)) {
            processSensorData(payload);
        }
        else if(topic.equals(deviceResponseTopic)) {
            log.info("Phản hồi trạng thái thiết bị từ ESP32: {}", payload);
            //xử lý sau
        }
    }

    //xử lý tin Json sensor_data từ hw
    private void processSensorData(String payload) {
        try {
            JsonNode rootNode = objectMapper.readTree(payload);

            LocalDateTime now = LocalDateTime.now();
            List<DataSensor> readingsToSave = new ArrayList<>();

            BigDecimal tempVal = null;
            WarningLevel tempWarn = WarningLevel.SAFE;
            BigDecimal humidityVal = null;
            WarningLevel humidityWarn = WarningLevel.SAFE;
            BigDecimal lightVal = null;
            WarningLevel lightWarn = WarningLevel.SAFE;

            //nhiệt độ
            if(rootNode.has("temperature") && !rootNode.get("temperature").isNull()) {
                tempVal = BigDecimal.valueOf(rootNode.get("temperature").asDouble());
                DataSensor ds = buildSensorReading(SensorDataType.temperature, tempVal, "°C", now);
                if(ds != null) {
                    readingsToSave.add(ds);
                    tempWarn = ds.getWarningLevel();
                }
            }

            //độ ẩm
            if(rootNode.has("humidity") && !rootNode.get("humidity").isNull()) {
                humidityVal = BigDecimal.valueOf(rootNode.get("humidity").asDouble());
                DataSensor ds = buildSensorReading(SensorDataType.humidity, humidityVal, "%", now);
                if(ds != null) {
                    readingsToSave.add(ds);
                    humidityWarn = ds.getWarningLevel();
                }
            }

            //ánh sáng
            if(rootNode.has("light") && !rootNode.get("light").isNull()) {
                lightVal = BigDecimal.valueOf(rootNode.get("light").asDouble());
                DataSensor ds = buildSensorReading(SensorDataType.light, lightVal, "lux", now);
                if(ds != null) {
                    readingsToSave.add(ds);
                    lightWarn = ds.getWarningLevel();
                }
            }

            if(!readingsToSave.isEmpty()) {
                dataSensorRepository.saveAll(readingsToSave);
            }

            //gửi dữ liệu realtime
            SensorRealtimeResponse realtimeData = SensorRealtimeResponse.builder()
                .temperature(tempVal)
                .tempWarning(tempWarn)
                .tempUnit("°C")
                .humidity(humidityVal)
                .humidityWarning(humidityWarn)
                .humidityUnit("%")
                .light(lightVal)
                .lightWarning(lightWarn)
                .lightUnit("Lux")
                .time(now)
                .build();

            //gửi tin qua websocket
            messagingTemplate.convertAndSend("/topic/sensor-update", realtimeData);
            log.info("Đã đẩy dữ liệu cảm biến tổng hợp qua WebSocket: {}", realtimeData);

        } catch (Exception e) {
            log.error("Lỗi khi parse JSON cảm biến: {} | Payload: {}", e.getMessage(), payload);
        }
    }

    //đánh giá ngưỡng cảnh báo
    private DataSensor buildSensorReading(SensorDataType dataType, BigDecimal value, String unit, LocalDateTime timestamp) {
        Sensor sensor = sensorRepository.findByDataType(dataType).orElse(null);

        if(sensor == null) {
            log.warn("Chưa có cấu hình cho loại cảm biến {} trong database! Vui lòng thêm dữ liệu vào bảng sensors.", dataType);
            return null;
        }

        WarningLevel warningLevel = WarningLevel.SAFE;
        if(sensor.getMinThreshold() != null && value.compareTo(sensor.getMinThreshold()) < 0) {
            warningLevel = WarningLevel.WARNING;
        }
        else if(sensor.getMaxThreshold() != null && value.compareTo(sensor.getMaxThreshold()) > 0) {
            warningLevel = WarningLevel.WARNING;
        }

        DataSensor dataSensor = DataSensor.builder()
            .id(UUID.randomUUID().toString())
            .sensor(sensor)
            .value(value)
            .unit(unit)
            .warningLevel(warningLevel)
            .time(timestamp)
            .build();

        return dataSensor;
    }

    //publish topic xuống phần cứng
    public void publishMessage(String topic, String payload) {
        try {
            if(mqttClient == null || !mqttClient.isConnected()) {
                log.error("Không thể publish tin nhắn vì MQTT Client chưa kết nối!");
                return;
            }

            MqttMessage message = new MqttMessage(payload.getBytes(StandardCharsets.UTF_8));
            message.setQos(1);
            mqttClient.publish(topic, message);

            log.info("Đã publish lệnh tới topic [{}]: {}", topic, payload);
        } catch (Exception e) {
            log.error("Lỗi khi publish tin nhắn tới topic {}: {}", topic, e.getMessage());
        }
    }
}
