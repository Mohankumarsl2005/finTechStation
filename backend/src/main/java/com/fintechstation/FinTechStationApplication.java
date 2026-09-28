package com.fintechstation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FinTechStationApplication {
    public static void main(String[] args) {
        SpringApplication.run(FinTechStationApplication.class, args);
    }
}
