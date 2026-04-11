package com.example.coplaybackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CoplaybackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CoplaybackendApplication.class, args);
    }

}
