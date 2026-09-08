package com.iot.smartmedicine.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.iot.smartmedicine.common.SensorDataType;
import com.iot.smartmedicine.entity.Sensor;

@Repository 
public interface SensorRepository extends JpaRepository<Sensor,String>{
    Optional<Sensor> findByDataType(SensorDataType dataType);
}
