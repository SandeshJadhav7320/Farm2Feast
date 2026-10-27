package com.example.backend.Product.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadImage(MultipartFile file) {

        validateImage(file);

        try {

            String publicId =
                    "farm2feast/products/" + UUID.randomUUID();

            Map<String, Object> uploadResult =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "public_id", publicId,
                                    "resource_type", "image"
                            )
                    );

            return uploadResult.get("secure_url").toString();

        } catch (IOException exception) {

            throw new RuntimeException(
                    "Failed to upload image to Cloudinary",
                    exception
            );
        }
    }

    private void validateImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Product image is required"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !ALLOWED_CONTENT_TYPES.contains(contentType)) {

            throw new IllegalArgumentException(
                    "Only JPG, PNG, and WEBP images are allowed"
            );
        }

        if (file.getSize() > 5 * 1024 * 1024) {

            throw new IllegalArgumentException(
                    "Image size must not exceed 5MB"
            );
        }
    }

    public void deleteImage(String publicId) {

        try {

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap(
                            "resource_type", "image",
                            "type", "upload",
                            "invalidate", true
                    )
            );

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Failed to delete image from Cloudinary",
                    exception
            );
        }
    }
}