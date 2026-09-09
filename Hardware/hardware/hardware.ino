#include<WiFi.h>
#include<PubSubClient.h>
#include<DHT.h>
#include<ArduinoJson.h>

const char* ssid = "Datthem :>"; //"Datthem :>"
const char* password = "@bakhongkhonghai"; //"@bakhongkhonghai"
const char* mqtt_server = "172.20.10.2"; //172.20.10.2, 192.168.10.97

//cấu hình chân cắm
#define DHTPIN 15
#define DHTTYPE DHT11
#define LIGHT_PIN 34
#define LED1_PIN 18
#define LED2_PIN 19
#define LED3_PIN 21

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;
unsigned long lastReconnectAttempt = 0;

//kết nối wifi
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Đang kết nối Wifi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWifi đã kết nối");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

//nhận dữ liệu điều khiển (subscribe)
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Nhận tin từ topic: ");
  Serial.println(topic);

  //byte -> string
  String messageTemp;
  for(int i=0; i < length; i++) {
    messageTemp += (char)payload[i];
  }
  Serial.println("Nội dung: " + messageTemp);

  String topicStr = String(topic);

  if(topicStr.startsWith("device_control/")) {
    String device_id = topicStr.substring(15);

    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, messageTemp);

    if (error) {
      Serial.print("Phân tích JSON thất bại: ");
      Serial.println(error.c_str());
      return;
    }

    String action = doc["action"]; // "ON" hoặc "OFF"
    String status = "FAILED";      // Mặc định là lỗi, nếu bật thành công sẽ đổi thành SUCCESS/ON
    
    // Áp dụng hành động dựa theo device_id
    if (device_id == "led1") {
      digitalWrite(LED1_PIN, (action == "ON") ? HIGH : LOW);
      status = (digitalRead(LED1_PIN) == HIGH) ? "ON" : "OFF";
    } 
    else if (device_id == "led2") {
      digitalWrite(LED2_PIN, (action == "ON") ? HIGH : LOW);
      status = (digitalRead(LED2_PIN) == HIGH) ? "ON" : "OFF";
    } 
    else if (device_id == "led3") {
      digitalWrite(LED3_PIN, (action == "ON") ? HIGH : LOW);
      status = (digitalRead(LED3_PIN) == HIGH) ? "ON" : "OFF";
    }

    //đóng Json
    StaticJsonDocument<200> responseDoc;
    responseDoc["device_id"] = device_id;
    responseDoc["action"] = action;
    responseDoc["status"] = status;
    char responseBuffer[256];
    serializeJson(responseDoc, responseBuffer);
    
    // Gửi lên topic phản hồi
    client.publish("device_control_resp", responseBuffer);
    Serial.println("Đã gửi phản hồi điều khiển: " + String(responseBuffer));
  }
  else if(topicStr == "device_status_req") {
    String actualLed1Status = (digitalRead(LED1_PIN) == HIGH) ? "ON" : "OFF";
    String actualLed2Status = (digitalRead(LED2_PIN) == HIGH) ? "ON" : "OFF";
    String actualLed3Status = (digitalRead(LED3_PIN) == HIGH) ? "ON" : "OFF";

    StaticJsonDocument<200> responseDoc;
    responseDoc["led1"] = actualLed1Status;
    responseDoc["led2"] = actualLed2Status;
    responseDoc["led3"] = actualLed3Status;

    char responseBuffer[256];
    serializeJson(responseDoc, responseBuffer);
    client.publish("device_status_resp", responseBuffer);
    Serial.println("Đã gửi phản hồi: " + String(responseBuffer));
  }
}

//kết nối lại MQTT broker (Non-blocking)
boolean reconnect() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Mất kết nối WiFi, đang thử kết nối lại...");
    WiFi.disconnect();
    WiFi.reconnect();
    return false;
  }

  Serial.print("Đang thử kết nối MQTT Broker...");
  String clientId = "ESP32Client-" + String(random(0xffff), HEX);
  
  if (client.connect(clientId.c_str())) {
    Serial.println("Thành công!");
    // Dùng dấu '+' để subcribe tất cả các id (vd: device_control/led1, device_control/led2...)
    client.subscribe("device_control/+"); 
    
    // Vẫn subcribe bình thường cho yêu cầu lấy trạng thái
    client.subscribe("device_status_req");
    return true;
  } else {
    Serial.print("Thất bại, mã lỗi: ");
    Serial.print(client.state());
    Serial.println(" Thử lại sau 5 giây");
    return false;
  }
}

//setup (chạy 1 lần khi khởi động)
void setup() {
  Serial.begin(115200);

  //thiết lập chân led là output
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  pinMode(LED3_PIN, OUTPUT);
  digitalWrite(LED1_PIN, LOW);
  digitalWrite(LED2_PIN, LOW);
  digitalWrite(LED3_PIN, LOW);

  dht.begin();
  setup_wifi();

  client.setServer(mqtt_server, 1883);
  client.setBufferSize(512);
  client.setCallback(callback);
}

//hàm vòng lặp chính
void loop() {
  unsigned long now = millis();

  // Kiểm tra kết nối MQTT theo kiểu Non-blocking (mỗi 5 giây)
  if (!client.connected()) {
    if (now - lastReconnectAttempt > 5000) {
      lastReconnectAttempt = now;
      if (reconnect()) {
        lastReconnectAttempt = 0; // Đặt lại nếu kết nối thành công
      }
    }
  } else {
    // Chỉ duy trì MQTT khi đã kết nối
    client.loop();
  }

  //gửi dữ liệu mỗi 2 giây
  if(now - lastMsg > 2000) {
    lastMsg = now;

    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    // light
    int rawValue = analogRead(LIGHT_PIN);
    Serial.print("Gia tri Raw ADC: ");
    Serial.println(rawValue);

    // 2. Tính toán Lux chuẩn theo mạch (LDR nối 3V3, R nối GND)
    float lux = 0;
    if (rawValue > 0 && rawValue < 4095) {
      float voltage = (float)rawValue / 4095.0 * 3.3;
      float resistance = 10000.0 * (3.3 - voltage) / voltage;
      lux = pow(500000.0 / resistance, 1.4);
    } else if (rawValue >= 4095) {
      lux = 2000.0;
    }

    StaticJsonDocument<200> doc;
    char mqttBuffer[256];

    //kiểm tra xem đọc lỗi không
    if(isnan(temperature) || isnan(humidity)) {
      Serial.println("Lỗi: Không đọc được dữ liệu từ DHT11!");
      doc["status"] = "error";
      doc["message"] = "sensor_failed";
      serializeJson(doc, mqttBuffer);
      Serial.print("Đang gửi cảnh báo lỗi: ");
      Serial.println(mqttBuffer);
      if (client.connected()) {
        client.publish("sensor_status", mqttBuffer);
      }
    } else {
      //đóng thành JSON nếu dữ liệu hợp lệ
      doc["temperature"] = temperature;
      doc["humidity"] = humidity;
      doc["light"] = round(lux);
      serializeJson(doc, mqttBuffer);
      
      Serial.print("Đang gửi dữ liệu: ");
      Serial.println(mqttBuffer);
      
      if (client.connected()) {
        client.publish("sensor_data", mqttBuffer);
      }
    }
  }
}


