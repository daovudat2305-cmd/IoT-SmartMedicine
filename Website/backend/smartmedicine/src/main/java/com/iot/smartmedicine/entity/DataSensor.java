package com.iot.smartmedicine.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.iot.smartmedicine.common.WarningLevel;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table (name = "data_sensor")
@Data 
@Builder 
@AllArgsConstructor 
@NoArgsConstructor 
public class DataSensor {
    @Id 
    private String id;

    @ManyToOne (fetch = FetchType.LAZY)
    @JoinColumn (name = "sensor_id", nullable = false)
    private Sensor sensor;

    @Column (name = "warning_level", nullable = false)
    private WarningLevel warningLevel;

    @Column (nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Column (nullable = false)
    private String unit;

    @Column (nullable = false)
    private LocalDateTime time;
}
