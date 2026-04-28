package com.example.coplaybackend.Repositories.Teams;
import com.example.coplaybackend.Entities.Teams.HistoriqueAction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.awt.*;
import java.util.List;

public interface HistoriqueActionRepository extends MongoRepository<HistoriqueAction,String> {

    List<HistoriqueAction> findByTeamId(String teamId);

    void deleteByTeamId(String teamId);

}
