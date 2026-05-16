package com.example.coplaybackend.Entities.Teams;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "team_members")
@CompoundIndex(name = "unique_member",
        def = "{'teamId': 1, 'userId': 1}",
        unique = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMember {

    @Id
    private String id;

    private String teamId;           // ref → Team

    private String userId;           // ref → User

    private RoleEquipe roleEquipe;

    private LocalDate joinedAt;

    @Builder.Default
    private Boolean active = true;
}
