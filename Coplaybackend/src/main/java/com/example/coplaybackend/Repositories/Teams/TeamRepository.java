package com.example.coplaybackend.Repositories.Teams;

import com.example.coplaybackend.Entities.Teams.Team;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TeamRepository extends MongoRepository<Team,String> {

    List<Team> findByCity(String city);

    List<Team> findBySport(String sport);

    List<Team> findByStatus(String status);

}