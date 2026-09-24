package com.iot.smartmedicine.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.iot.smartmedicine.common.SensorDataType;
import com.iot.smartmedicine.entity.DataSensor;

@Repository 
public interface DataSensorRepository extends JpaRepository<DataSensor,Long>{
    //tìm bản ghi mới nhất theo loại data
    Optional<DataSensor> findTopBySensor_DataTypeOrderByTimeDesc(SensorDataType dataType);

    List<DataSensor> findTop20BySensor_DataTypeOrderByTimeDesc(SensorDataType dataType);

    @Query (value = """
        SELECT ds FROM DataSensor ds
        JOIN ds.sensor s
        WHERE (:dataType IS NULL OR s.dataType = :dataType)
        AND (
            :keyword IS NULL OR
            CAST(ds.value AS String) LIKE CONCAT('%', :keyword, '%') OR
            ds.unit LIKE CONCAT('%', :keyword, '%') OR
            CONCAT(CAST(ds.value AS String), ds.unit) LIKE CONCAT('%', :keyword, '%') OR
            CONCAT(CAST(ds.value AS String), ' ', ds.unit) LIKE CONCAT('%', :keyword, '%') OR
            CAST(FUNCTION('DATE_FORMAT', ds.time, '%Y-%m-%d %H:%i:%s') AS String) LIKE CONCAT('%', :keyword, '%') OR
            CAST(FUNCTION('DATE_FORMAT', ds.time, '%d-%m-%Y %H:%i:%s') AS String) LIKE CONCAT('%', :keyword, '%') OR
            CAST(FUNCTION('DATE_FORMAT', ds.time, '%d/%m/%Y %H:%i:%s') AS String) LIKE CONCAT('%', :keyword, '%') OR
            CAST(FUNCTION('DATE_FORMAT', ds.time, '%H:%i:%s %d-%m-%Y') AS String) LIKE CONCAT('%', :keyword, '%')
        )
    """,
    countQuery = """
        SELECT COUNT(ds) FROM DataSensor ds
        JOIN ds.sensor s
        WHERE (:dataType IS NULL OR s.dataType = :dataType)
        AND (
            :keyword IS NULL OR
            CAST(ds.value AS String) LIKE CONCAT('%', :keyword, '%') OR
            ds.unit LIKE CONCAT('%', :keyword, '%') OR
            CONCAT(CAST(ds.value AS String), ds.unit) LIKE CONCAT('%', :keyword, '%') OR
            CONCAT(CAST(ds.value AS String), ' ', ds.unit) LIKE CONCAT('%', :keyword, '%') OR
            CAST(FUNCTION('DATE_FORMAT', ds.time, '%Y-%m-%d %H:%i:%s') AS String) LIKE CONCAT('%', :keyword, '%') OR
            CAST(FUNCTION('DATE_FORMAT', ds.time, '%d-%m-%Y %H:%i:%s') AS String) LIKE CONCAT('%', :keyword, '%') OR
            CAST(FUNCTION('DATE_FORMAT', ds.time, '%d/%m/%Y %H:%i:%s') AS String) LIKE CONCAT('%', :keyword, '%') OR
            CAST(FUNCTION('DATE_FORMAT', ds.time, '%H:%i:%s %d-%m-%Y') AS String) LIKE CONCAT('%', :keyword, '%')
        )     
    """)
    @EntityGraph (attributePaths = {"sensor"})
    Page<DataSensor> findAllWithFilter(@Param("dataType") SensorDataType dataType, @Param("keyword") String keyword, Pageable pageable);
}
