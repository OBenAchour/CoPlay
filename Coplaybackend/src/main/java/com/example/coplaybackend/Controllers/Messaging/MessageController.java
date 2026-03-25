package com.example.coplaybackend.Controllers.Messaging;

import com.example.coplaybackend.Entities.Messaging.Message;
import com.example.coplaybackend.Entities.Messaging.MessageMedia;
import com.example.coplaybackend.Entities.Messaging.MediaType;
import com.example.coplaybackend.Services.Messaging.MessageService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;

    // ── POST /api/messages ───────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Message> send(@RequestBody SendMessageRequest req) {
        Message msg = messageService.sendMessage(
                req.getConversationId(), req.getSenderId(), req.getContent());
        return ResponseEntity.ok(msg);
    }

    // ── GET /api/messages/conversation/{conversationId} ──────────────────────
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<Message>> getByConversation(@PathVariable String conversationId) {
        return ResponseEntity.ok(messageService.getMessages(conversationId));
    }

    // ── DELETE /api/messages/{id}?requestingUserId=… ─────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Message> delete(@PathVariable String id,
                                          @RequestParam String requestingUserId) {
        return ResponseEntity.ok(messageService.deleteMessage(id, requestingUserId));
    }

    // ── PATCH /api/messages/conversation/{conversationId}/read?userId=… ──────
    @PatchMapping("/conversation/{conversationId}/read")
    public ResponseEntity<Void> markRead(@PathVariable String conversationId,
                                         @RequestParam String userId) {
        messageService.markConversationAsRead(conversationId, userId);
        return ResponseEntity.noContent().build();
    }

    // ── POST /api/messages/{id}/media ─────────────────────────────────────────
    @PostMapping("/{id}/media")
    public ResponseEntity<MessageMedia> addMedia(@PathVariable String id,
                                                 @RequestBody AddMediaRequest req) {
        MessageMedia media = messageService.addMedia(
                id, req.getMediaType(), req.getUrl(), req.getFileName(), req.getSizeBytes());
        return ResponseEntity.ok(media);
    }

    // ── GET /api/messages/{id}/media ──────────────────────────────────────────
    @GetMapping("/{id}/media")
    public ResponseEntity<List<MessageMedia>> getMedia(@PathVariable String id) {
        return ResponseEntity.ok(messageService.getMediaForMessage(id));
    }

    // ─── Inner request DTOs ───────────────────────────────────────────────────
    @Data
    static class SendMessageRequest {
        private String conversationId;
        private String senderId;
        private String content;
    }

    @Data
    static class AddMediaRequest {
        private MediaType mediaType;
        private String url;
        private String fileName;
        private Long sizeBytes;
    }
}