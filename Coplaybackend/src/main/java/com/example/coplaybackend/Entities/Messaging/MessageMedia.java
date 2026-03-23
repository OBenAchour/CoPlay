package com.example.coplaybackend.Entities.Messaging;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "message_media")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageMedia {

    @Id
    private String mediaId;

    private Message message;

    private MediaType mediaType;

    private String url;

    private String fileName;

    private Long sizeBytes;
}
