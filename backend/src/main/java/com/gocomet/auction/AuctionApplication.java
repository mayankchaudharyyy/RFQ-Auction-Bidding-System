package com.gocomet.auction;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class AuctionApplication {

	public static void main(String[] args) {
        // Load .env variables into System properties if .env file exists
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory("../backend-node") // Use the existing .env file from Node.js backend
                    .ignoreIfMissing()
                    .load();
            dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
        } catch (Exception e) {
            System.out.println(".env not found or failed to load, falling back to existing environment variables.");
        }

		SpringApplication.run(AuctionApplication.class, args);
	}

}
