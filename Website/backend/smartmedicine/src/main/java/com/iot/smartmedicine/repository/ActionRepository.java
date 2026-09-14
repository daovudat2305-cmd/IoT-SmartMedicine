package com.iot.smartmedicine.repository;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.iot.smartmedicine.common.ActionStatus;
import com.iot.smartmedicine.entity.Action;

@Repository 
public interface ActionRepository extends JpaRepository<Action,Long>{

    @Query ("""
        SELECT act FROM Action act
        JOIN FETCH act.device d
        WHERE (:deviceId IS NULL OR d.id = :deviceId)
        AND (:action IS NULL OR act.action = :action)
        AND (:actionStatus IS NULL OR act.status = :actionStatus)
        AND (:startTime IS NULL OR act.time >= :startTime)
        AND (:endTime IS NULL OR act.time <= :endTime)
    """)
    Page<Action> findAllWithFilters(
        @Param("deviceId") String deviceId,
        @Param("action") String action,
        @Param("actionStatus") ActionStatus actionStatus,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        Pageable pageable
    );
}
