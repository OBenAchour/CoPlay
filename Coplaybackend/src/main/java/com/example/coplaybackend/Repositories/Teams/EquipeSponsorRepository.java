package com.example.coplaybackend.Repositories.Teams;


import com.example.coplaybackend.Entities.Teams.EquipeSponsor;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EquipeSponsorRepository extends MongoRepository<EquipeSponsor, String> {

    List<EquipeSponsor> findByTeamId(String teamId);

}
