package com.iot.smartmedicine.entity;

import java.time.LocalDateTime;

import com.iot.smartmedicine.common.DeviceStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table (name = "devices")
@Data 
@Builder 
@AllArgsConstructor 
@NoArgsConstructor 
public class Device {
    @Id
    private String id;

    @Column (nullable = false)
    private String name;

    @Column (nullable = false)
    private DeviceStatus status;

    @Column (name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column (name = "updated_at")
    private LocalDateTime updatedAt;
}
