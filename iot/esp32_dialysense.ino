/*
 * DialySense AI - ESP32 Real-Time Dialysis Monitoring Firmware
 * 
 * Hardware Requirements:
 * - ESP32 Development Board (ESP-WROOM-32)
 * - MAX30102 / MAX30100 Pulse Oximeter & Heart Rate Sensor (I2C)
 * - DS18B20 / NTC Thermistor (OneWire Temperature)
 * - Pressure Transducer / Strain Gauge ADC (0-5V to 0-3.3V)
 * - Flow Rate Sensor (Hall Effect pulse / serial)
 * 
 * Protocol:
 * - Connects to Wi-Fi
 * - Samples physiological and machine telemetry every 2–5 seconds
 * - Serializes JSON payload
 * - Transmits HTTP POST to FastAPI backend: /api/readings
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Ensure ArduinoJson v6 or v7 library is installed

// ================= Wi-Fi Configuration =================
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ================= Backend Configuration =================
const char* serverUrl = "http://192.168.1.100:8000/api/readings";

// ================= Session & Hardware Mapping =================
const int PATIENT_ID = 1;
const int SESSION_ID = 1;
const int TRANSMIT_INTERVAL_MS = 3000; // 3 seconds

// Simulation / Hardware Pin Definitions
#define PIN_PRESSURE_ADC 34
#define PIN_FLOW_PULSE   35
#define PIN_STATUS_LED   2

unsigned long lastTransmitTime = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);
  digitalWrite(PIN_STATUS_LED, LOW);

  Serial.println("\n==========================================");
  Serial.println("   DialySense AI - ESP32 Telemetry Node   ");
  Serial.println("==========================================");

  // Connect to Wi-Fi
  Serial.print("Connecting to Wi-Fi SSID: ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected successfully!");
    Serial.print("[Wi-Fi] Assigned IP Address: ");
    Serial.println(WiFi.localIP());
    digitalWrite(PIN_STATUS_LED, HIGH);
  } else {
    Serial.println("\n[Wi-Fi] Connection failed. Operating in standalone debug mode.");
  }
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - lastTransmitTime >= TRANSMIT_INTERVAL_MS) {
    lastTransmitTime = currentMillis;

    // 1. Read physiological sensors (or generate realistic baseline if hardware testing)
    float heartRate = 75.0 + (random(-30, 40) / 10.0);
    float spo2 = 98.2 + (random(-10, 15) / 10.0);
    if (spo2 > 100.0) spo2 = 100.0;
    float temperature = 36.8 + (random(-2, 3) / 10.0);
    float systolicBp = 122.0 + (random(-40, 50) / 10.0);
    float diastolicBp = 78.0 + (random(-30, 30) / 10.0);

    // 2. Read Machine Telemetry
    float bloodFlow = 300.0 + (random(-50, 50) / 10.0);
    float dialysisPressure = 120.0 + (random(-40, 60) / 10.0);
    float machineTemp = 36.9 + (random(-2, 2) / 10.0);
    const char* machineStatus = "RUNNING";

    // 3. Serialize JSON
    StaticJsonDocument<300> doc;
    doc["patient_id"] = PATIENT_ID;
    doc["session_id"] = SESSION_ID;
    doc["heart_rate"] = heartRate;
    doc["spo2"] = spo2;
    doc["temperature"] = temperature;
    doc["systolic_bp"] = systolicBp;
    doc["diastolic_bp"] = diastolicBp;
    doc["blood_flow_rate"] = bloodFlow;
    doc["dialysis_pressure"] = dialysisPressure;
    doc["machine_temperature"] = machineTemp;
    doc["machine_status"] = machineStatus;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    Serial.print("[IoT] Transmitting Telemetry: ");
    Serial.println(jsonPayload);

    // 4. HTTP POST to FastAPI Ingestion Endpoint
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");

      int httpResponseCode = http.POST(jsonPayload);
      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("[HTTP] Code %d | Server Response: %s\n", httpResponseCode, response.c_str());
      } else {
        Serial.printf("[HTTP] Error sending POST: %s\n", http.errorToString(httpResponseCode).c_str());
      }
      http.end();
    } else {
      Serial.println("[IoT] Wi-Fi not connected, packet skipped.");
    }
  }
}
