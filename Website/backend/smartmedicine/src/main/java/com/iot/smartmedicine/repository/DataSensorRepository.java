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
public interface DataSensorRepository extends JpaRepository<DataSensor,String>{
    //tìm bản ghi mới nhất theo loại data
    Optional<DataSensor> findTopBySensor_DataTypeOrderByTimeDesc(SensorDataType dataType);

    List<DataSensor> findTop20BySensor_DataTypeOrderByTimeDesc(SensorDataType dataType);

    @Query ("""
        SELECT ds FROM DataSensor ds
        JOIN ds.sensor s
        WHERE (:dataType IS NULL OR s.dataType = :dataType)
    """)
    @EntityGraph (attributePaths = {"sensor"})
    Page<DataSensor> findAllWithFilter(@Param("dataType") SensorDataType dataType,Pageable pageable);
}
