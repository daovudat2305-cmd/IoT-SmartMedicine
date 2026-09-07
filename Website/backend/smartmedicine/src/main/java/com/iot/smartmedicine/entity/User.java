package com.iot.smartmedicine.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table(name = "user")
@Data 
@Builder 
@AllArgsConstructor 
@NoArgsConstructor 
public class User {
    @Id 
    @GeneratedValue (strategy = GenerationType.UUID)
    private String id;

    @Column (nullable = false, unique = true)
    private String email;

    @Column (nullable = false)
    private String fullname;

    @Column (nullable = false)
    private String password;

    private String docs;
    private String figma;
    private String github;
    private String apiDocs;
}
