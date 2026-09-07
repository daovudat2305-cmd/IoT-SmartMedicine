package com.iot.smartmedicine.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.iot.smartmedicine.entity.User;

@Repository 
public interface UserRepository extends JpaRepository<User,String>{

}
