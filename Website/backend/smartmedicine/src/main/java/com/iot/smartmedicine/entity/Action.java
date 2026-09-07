package com.iot.smartmedicine.entity;

import java.time.LocalDateTime;

import com.iot.smartmedicine.common.ActionStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table (name = "action")
@Data 
@Builder 
@AllArgsConstructor 
@NoArgsConstructor 
public class Action {
    @Id 
    private String id;

    @ManyToOne (fetch = FetchType.LAZY)
    @JoinColumn (name = "device_id", nullable = false)
    private Device device;

    @Column (nullable = false)
    private String action;

    @Column (nullable = false)
    private ActionStatus status;

    @Column (nullable = false)
    private LocalDateTime time;
}
