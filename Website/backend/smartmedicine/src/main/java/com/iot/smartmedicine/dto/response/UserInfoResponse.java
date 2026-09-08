package com.iot.smartmedicine.dto.response;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class UserInfoResponse {
    private String email;
    private String fullName;
    private String docs;
    private String figma;
    private String github;
    private String apiDocs;
}
