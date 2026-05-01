package com.ict06.team1_fin_pj.domain.calendar.repository;

import com.ict06.team1_fin_pj.domain.calendar.entity.ScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalendarRepository extends JpaRepository<ScheduleEntity, Integer> {

}
