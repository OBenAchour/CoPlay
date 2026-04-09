package com.example.coplaybackend.Controllers.Messaging;

import com.example.coplaybackend.DTOs.Messaging.*;
import com.example.coplaybackend.Entities.Messaging.Message;
import com.example.coplaybackend.Entities.Messaging.MessageMedia;
import com.example.coplaybackend.Services.Messaging.MessageService;
import com.example.coplaybackend.Services.Messaging.FileStorageService;
import com.example.coplaybackend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class MessageController {

    private final MessageService messageService;
    private final FileStorageService fileStorageService;

    /**
     * POST /api/messages - Send a new message
     */
    @PostMapping
    public ResponseEntity<Message> send(@Valid @RequestBody SendMessageRequest req) {
        String senderId = SecurityUtils.getCurrentUserId();
        log.info("Sending message from user: {} in conversation: {}", senderId, req.getConversationId());
        Message msg = messageService.sendMessage(req.getConversationId(), senderId, req.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(msg);
    }

    /**
     * GET /api/messages/conversation/{conversationId} - Get all messages in a conversation
     */
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<Message>> getByConversation(@PathVariable String conversationId) {
        String requestingUserId = SecurityUtils.getCurrentUserId();
        log.info("Fetching messages for conversation: {} by user: {}", conversationId, requestingUserId);
        return ResponseEntity.ok(messageService.getMessages(conversationId, requestingUserId));
    }

    /**
     * DELETE /api/messages/{id} - Delete a message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Message> delete(@PathVariable String id) {
        String requestingUserId = SecurityUtils.getCurrentUserId();
        log.info("Deleting message: {} by user: {}", id, requestingUserId);
        return ResponseEntity.ok(messageService.deleteMessage(id, requestingUserId));
    }

    /**
     * PATCH /api/messages/conversation/{conversationId}/read - Mark conversation as read
     */
    @PatchMapping("/conversation/{conversationId}/read")
    public ResponseEntity<Void> markRead(@PathVariable String conversationId) {
        String userId = SecurityUtils.getCurrentUserId();
        log.info("Marking conversation: {} as read for user: {}", conversationId, userId);
        messageService.markConversationAsRead(conversationId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/messages/{id}/status - Update message status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<MessageStatusResponse> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody MessageStatusUpdateRequest req) {
        String requestingUserId = SecurityUtils.getCurrentUserId();
        log.info("Updating message: {} status to: {} by user: {}", id, req.getStatus(), requestingUserId);

        Message message = messageService.updateMessageStatus(id, req.getStatus(), requestingUserId);

        MessageStatusResponse response = MessageStatusResponse.builder()
                .messageId(message.getMessageId())
                .status(message.getStatus())
                .updatedAt(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/conversations/{conversationId}/messages/read - Mark messages as read
     */
    @PostMapping("/conversations/{conversationId}/messages/read")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable String conversationId,
            @RequestBody List<String> messageIds) {
        String requestingUserId = SecurityUtils.getCurrentUserId();
        log.info("Marking {} messages as read in conversation: {} by user: {}",
                messageIds.size(), conversationId, requestingUserId);

        messageService.markMessagesAsRead(conversationId, messageIds, requestingUserId);

        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/conversations/{conversationId}/messages/unread-count - Get unread message count
     */
    @GetMapping("/conversations/{conversationId}/messages/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable String conversationId) {
        String requestingUserId = SecurityUtils.getCurrentUserId();
        log.info("Fetching unread count for conversation: {} by user: {}", conversationId, requestingUserId);

        long count = messageService.getUnreadCount(conversationId, requestingUserId);

        return ResponseEntity.ok(count);
    }

    /**
     * POST /api/messages/{id}/media/upload - Upload media for a message (CORRECTED)
     */
    @PostMapping("/{id}/media/upload")
    public ResponseEntity<FileUploadResponse> uploadMedia(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws IOException {
        String requestingUserId = SecurityUtils.getCurrentUserId();
        log.info("Uploading media for message: {} by user: {}", id, requestingUserId);

        MessageMedia media = messageService.uploadMediaForMessage(id, file, requestingUserId);

        FileUploadResponse response = FileUploadResponse.builder()
                .mediaId(media.getMediaId())
                .fileName(media.getFileName())
                .fileUrl(media.getUrl())
                .mediaType(media.getMediaType())
                .fileSizeBytes(media.getSizeBytes())
                .uploadedAt(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/files/download/{fileReference} - Download media file
     */
    @GetMapping("/download/{fileReference}")
    public ResponseEntity<?> downloadFile(@PathVariable String fileReference) {
        try {
            if (!fileStorageService.fileExists(fileReference)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found");
            }

            byte[] fileContent = fileStorageService.getFile(fileReference);
            String originalFileName = fileStorageService.getOriginalFileName(fileReference);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + originalFileName + "\"")
                    .body(fileContent);
        } catch (IOException e) {
            log.error("Error downloading file: {}", fileReference, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error downloading file");
        }
    }

    /**
     * GET /api/messages/{id}/media - Get all media for a message
     */
    @GetMapping("/{id}/media")
    public ResponseEntity<List<MessageMedia>> getMedia(@PathVariable String id) {
        String requestingUserId = SecurityUtils.getCurrentUserId();
        log.info("Fetching media for message: {} by user: {}", id, requestingUserId);
        return ResponseEntity.ok(messageService.getMediaForMessage(id));
    }
}
