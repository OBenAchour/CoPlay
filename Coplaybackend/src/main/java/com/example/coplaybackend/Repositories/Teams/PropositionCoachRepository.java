package com.example.coplaybackend.Repositories.Teams;
import com.example.coplaybackend.Entities.Teams.PropositionCoach;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PropositionCoachRepository extends MongoRepository<PropositionCoach,String> {

    List<PropositionCoach> findByCoachId(String coachId);

    List<PropositionCoach> findByTeamId(String teamId);


}
