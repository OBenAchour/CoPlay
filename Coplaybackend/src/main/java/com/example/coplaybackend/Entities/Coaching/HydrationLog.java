package com.example.coplaybackend.Entities.Coaching;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "hydration_logs")
@CompoundIndexes({
        @CompoundIndex(name = "uniq_user_date", def = "{'userId':1,'date':1}", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HydrationLog {

    @Id
    private String logId;

    @Indexed
    private String userId;

    private LocalDate date;

    private Integer ml;
    private Integer goalMl;
}
