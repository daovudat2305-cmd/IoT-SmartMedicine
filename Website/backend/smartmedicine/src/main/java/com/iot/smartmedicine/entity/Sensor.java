package com.iot.smartmedicine.entity;

import java.math.BigDecimal;

import com.iot.smartmedicine.common.SensorDataType;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table (name = "sensors")
@Data 
@Builder 
@AllArgsConstructor 
@NoArgsConstructor 
public class Sensor {
    @Id 
    private String id;

    @Column (nullable = false)
    private String name;

    @Column (name = "data_type", nullable = false)
    @Enumerated (EnumType.STRING)
    private SensorDataType dataType;

    @Column (name = "min_threshold", precision = 10, scale = 2)
    private BigDecimal minThreshold;

    @Column (name = "max_threshold", precision = 10, scale = 2)
    private BigDecimal maxThreshold;
}
