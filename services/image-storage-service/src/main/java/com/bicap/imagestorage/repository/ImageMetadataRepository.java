package com.bicap.imagestorage.repository;

import com.bicap.imagestorage.entity.ImageMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageMetadataRepository extends JpaRepository<ImageMetadata, Long> {

    Optional<ImageMetadata> findByStoredFilename(String storedFilename);

    Optional<ImageMetadata> findByIdAndIsActiveTrue(Long id);

    List<ImageMetadata> findByReferenceIdAndIsActiveTrue(String referenceId);

    List<ImageMetadata> findByCategoryAndIsActiveTrue(String category);

    List<ImageMetadata> findByUploadedByAndIsActiveTrue(String uploadedBy);

    @Query("SELECT i FROM ImageMetadata i WHERE i.referenceId = :referenceId AND i.category = :category AND i.isActive = true")
    List<ImageMetadata> findByReferenceIdAndCategory(
            @Param("referenceId") String referenceId,
            @Param("category") String category
    );

    boolean existsByStoredFilename(String storedFilename);
}
