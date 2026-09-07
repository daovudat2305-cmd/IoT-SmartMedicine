package com.iot.smartmedicine.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.iot.smartmedicine.entity.Sensor;

@Repository 
public interface SensorRepository extends JpaRepository<Sensor,String>{

}
