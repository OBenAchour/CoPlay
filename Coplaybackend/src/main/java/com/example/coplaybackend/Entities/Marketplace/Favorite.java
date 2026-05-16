package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "favorites")
@CompoundIndexes({
        @CompoundIndex(name = "uniq_fav", def = "{'userId':1,'targetId':1,'targetType':1}", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Favorite {

    @Id
    private String favoriteId;

    @Indexed
    private String userId;

    private String targetId;
    private String targetType;     // EQUIPMENT / SERVICE

    private LocalDateTime createdAt;
}
