package com.bicap.farm_management.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import javax.imageio.ImageIO;
import java.io.IOException;

public final class ProductImageValidator {
    private ProductImageValidator() {}
    public static void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ảnh sản phẩm.");
        if (file.getSize() > 5 * 1024 * 1024) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Ảnh tối đa 5 MB.");
        String type = file.getContentType();
        if (!"image/jpeg".equals(type) && !"image/png".equals(type)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ nhận ảnh JPG hoặc PNG.");
        try (var input = ImageIO.createImageInputStream(file.getInputStream())) {
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw new IOException("Invalid image");
            var reader = readers.next();
            try {
                reader.setInput(input);
                String format = reader.getFormatName();
                if (!("image/png".equals(type) && "png".equalsIgnoreCase(format)) && !("image/jpeg".equals(type) && "JPEG".equalsIgnoreCase(format))) throw new IOException("Image type mismatch");
                long pixels = (long) reader.getWidth(0) * reader.getHeight(0);
                if (pixels <= 0 || pixels > 25_000_000) throw new IOException("Image dimensions invalid");
                if (reader.read(0) == null) throw new IOException("Invalid image");
            } finally { reader.dispose(); }
        } catch (IOException | RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tệp không phải ảnh JPG/PNG hợp lệ hoặc ảnh vượt 25 triệu điểm ảnh.");
        }
    }
}
