package com.iot.smartmedicine.dto.response;

import java.util.Collections;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@Builder 
@AllArgsConstructor 
@NoArgsConstructor 
public class PageResponse<T> {
    private int currentPage;
    private int pageSize;
    private int totalPages;
    private long totalElements;

    @Builder.Default
    private List<T> content = Collections.emptyList();
}
