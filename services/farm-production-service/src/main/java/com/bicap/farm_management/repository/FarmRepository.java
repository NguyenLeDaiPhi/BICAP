package com.bicap.farm_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bicap.farm_management.entity.Farm;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {
}