package com.ict06.team1_fin_pj;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableJpaAuditing
@EnableScheduling
@SpringBootApplication
public class Team1FinPjApplication {

	public static void main(String[] args) {
		SpringApplication.run(Team1FinPjApplication.class, args);
	}

}
