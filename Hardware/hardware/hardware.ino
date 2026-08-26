#include<WiFi.h>
#include<PubSubClient.h>
#include<DHT.h>
#include<ArduinoJson.h>

const char* ssid = "p401";
const char* password = "401401401";
const char* mqtt_server = "192.168.10.59";

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

  if(String(topic) == "device_control") {
    //đọc json
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, messageTemp);

    if(error) {
      Serial.print("Phân tích JSON thất bại: ");
      Serial.println(error.c_str());
      return;
    }

    boolean success = true;
    String errorMessage = "hardware_failure:";

    //led 1
    if(doc.containsKey("led1")) {
      String led1Status = doc["led1"];
      if(led1Status == "ON") digitalWrite(LED1_PIN, HIGH);
      else if(led1Status == "OFF") digitalWrite(LED1_PIN, LOW);
      
      delay(10);
      String actual = (digitalRead(LED1_PIN) == HIGH) ? "ON" : "OFF";
      if(led1Status != actual) {
        success = false;
        errorMessage += "led1_";
      }
    }

    //led 2
    if(doc.containsKey("led2")) {
      String led2Status = doc["led2"];
      if(led2Status == "ON") digitalWrite(LED2_PIN, HIGH);
      else if(led2Status == "OFF") digitalWrite(LED2_PIN, LOW);
      
      delay(10);
      String actual = (digitalRead(LED2_PIN) == HIGH) ? "ON" : "OFF";
      if(led2Status != actual) {
        success = false;
        errorMessage += "led2_";
      }
    }

    //led 3
    if(doc.containsKey("led3")) {
      String led3Status = doc["led3"];
      if(led3Status == "ON") digitalWrite(LED3_PIN, HIGH);
      else if(led3Status == "OFF") digitalWrite(LED3_PIN, LOW);
      
      delay(10);
      String actual = (digitalRead(LED3_PIN) == HIGH) ? "ON" : "OFF";
      if(led3Status != actual) {
        success = false;
        errorMessage += "led3_";
      }
    }
    
    if(!success) {
      errorMessage.remove(errorMessage.length() - 1);
    }

    //phản hồi
    StaticJsonDocument<200> responseDoc;
    responseDoc["success"] = success;
    responseDoc["message"] = success ? "operation_successful" : errorMessage;
    responseDoc["led1"] = (digitalRead(LED1_PIN) == HIGH) ? "ON" : "OFF";
    responseDoc["led2"] = (digitalRead(LED2_PIN) == HIGH) ? "ON" : "OFF";
    responseDoc["led3"] = (digitalRead(LED3_PIN) == HIGH) ? "ON" : "OFF";

    char responseBuffer[256];
    serializeJson(responseDoc, responseBuffer);
    client.publish("device_response", responseBuffer);
    Serial.println("Đã gửi phản hồi: " + String(responseBuffer));
  }
  else if(String(topic) == "device_status_req") {
    String actualLed1Status = (digitalRead(LED1_PIN) == HIGH) ? "ON" : "OFF";
    String actualLed2Status = (digitalRead(LED2_PIN) == HIGH) ? "ON" : "OFF";
    String actualLed3Status = (digitalRead(LED3_PIN) == HIGH) ? "ON" : "OFF";

    StaticJsonDocument<200> responseDoc;
    responseDoc["led1"] = actualLed1Status;
    responseDoc["led2"] = actualLed2Status;
    responseDoc["led3"] = actualLed3Status;

    char responseBuffer[256];
    serializeJson(responseDoc, responseBuffer);
    client.publish("device_status_res", responseBuffer);
    Serial.println("Đã gửi phản hồi: " + String(responseBuffer));
  }
}

//kết nối lại MQTT broker
void reconnect() {
  while(!client.connected()) {
    Serial.print("Đang thử kết nối MQTT Broker...");

    String clientId = "ESP32Client-...";
    
    if(client.connect(clientId.c_str())) {
      Serial.println("Thành công!");
      client.subscribe("device_control");
      client.subscribe("device_status_req");
    }
    else {
      Serial.print("Thất bại, mã lỗi: ");
      Serial.print(client.state());
      Serial.println(" Thử lại trong 5 giây");
      delay(5000);
    }
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
  // luôn giữ kết nối với broker
  if(!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
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

    //kiểm tra xem đọc lỗi không
    if(isnan(temperature) || isnan(humidity)) {
      Serial.println("Lỗi: Không đọc được dữ liệu từ DHT11!");
      return;
    }

    //đóng thành JSON
    StaticJsonDocument<200> doc;
    doc["device_id"] = "ESP_01";
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["light"] = round(lux);

    char mqttBuffer[256];
    serializeJson(doc, mqttBuffer);

    Serial.print("Đang gửi dữ liệu: ");
    Serial.println(mqttBuffer);

    client.publish("sensor_data", mqttBuffer);
  }
}


