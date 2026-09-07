package com.iot.smartmedicine.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.iot.smartmedicine.entity.Action;

@Repository 
public interface ActionRepository extends JpaRepository<Action,String>{

}
