package com.gocomet.auction.repository;

import com.gocomet.auction.model.Rfq;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RfqRepository extends MongoRepository<Rfq, String> {
    List<Rfq> findAllByOrderByCreatedAtDesc();
}
