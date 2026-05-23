package com.gocomet.auction.repository;

import com.gocomet.auction.model.AuctionLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionLogRepository extends MongoRepository<AuctionLog, String> {
    List<AuctionLog> findAllByRfqIdOrderByCreatedAtAsc(String rfqId);
}
