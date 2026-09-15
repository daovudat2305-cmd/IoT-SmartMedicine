package com.iot.smartmedicine.entity;

import java.time.LocalDateTime;

import com.iot.smartmedicine.common.ActionStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table (name = "action", indexes = {
    @Index (name = "idx_action_device_time", columnList = "device_id, time DESC"),
    @Index (name = "idx_action_time", columnList = "time DESC"),
    @Index (name = "idx_action_status", columnList = "status")
})
@Data 
@Builder 
@AllArgsConstructor 
@NoArgsConstructor 
public class Action {
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne (fetch = FetchType.LAZY)
    @JoinColumn (name = "device_id", nullable = false)
    private Device device;

    @Column (nullable = false)
    private String action;

    @Column (nullable = false)
    @Enumerated (EnumType.STRING)
    private ActionStatus status;

    @Column (nullable = false)
    private LocalDateTime time;
}
