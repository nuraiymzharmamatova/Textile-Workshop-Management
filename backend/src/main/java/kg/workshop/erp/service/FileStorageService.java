package kg.workshop.erp.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String uploadFile(MultipartFile file);
    void deleteFile(String fileName);
    String getFileUrl(String fileName);
}
