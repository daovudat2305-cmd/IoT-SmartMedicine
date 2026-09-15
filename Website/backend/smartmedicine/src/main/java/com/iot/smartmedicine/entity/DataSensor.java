package com.iot.smartmedicine.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.iot.smartmedicine.common.WarningLevel;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table (name = "data_sensor", indexes = {
    @Index (name = "idx_data_sensor_sensor_time", columnList = "sensor_id, time DESC"),
    @Index (name = "idx_data_sensor_time", columnList = "time DESC")
})
@Data 
@Builder 
@AllArgsConstructor 
@NoArgsConstructor 
public class DataSensor {
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne (fetch = FetchType.LAZY)
    @JoinColumn (name = "sensor_id", nullable = false)
    private Sensor sensor;

    @Column (name = "warning_level", nullable = false)
    @Enumerated (EnumType.STRING)
    private WarningLevel warningLevel;

    @Column (nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Column (nullable = false)
    private String unit;

    @Column (nullable = false)
    private LocalDateTime time;
}
