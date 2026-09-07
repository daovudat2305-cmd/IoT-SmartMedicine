package com.iot.smartmedicine.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.iot.smartmedicine.entity.DataSensor;

@Repository 
public interface DataSensorRepository extends JpaRepository<DataSensor,String>{

}
