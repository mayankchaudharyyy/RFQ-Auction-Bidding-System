package com.gocomet.auction.repository;

import com.gocomet.auction.model.AuctionConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuctionConfigRepository extends MongoRepository<AuctionConfig, String> {
    Optional<AuctionConfig> findByRfqId(String rfqId);
}
