package com.ict06.team1_fin_pj.domain.aiSecretary.repository;

import com.ict06.team1_fin_pj.domain.aiSecretary.entity.DocumentProcessLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocumentProcessLogRepository extends JpaRepository<DocumentProcessLogEntity, Integer> {
    void deleteByDocument_DocId(Integer docId);
    Optional<DocumentProcessLogEntity> findTopByDocument_DocIdAndErrorMessageIsNotNullOrderByJobIdDesc(Integer docId);
}
