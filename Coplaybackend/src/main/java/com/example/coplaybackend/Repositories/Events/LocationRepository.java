package com.example.coplaybackend.Repositories.Events;

import com.example.coplaybackend.Entities.Events.Location;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LocationRepository extends MongoRepository<Location, String> {

    List<Location> findByNameContainingIgnoreCase(String name);
}
