package com.gocomet.auction.service;

import org.bson.Document;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
public class SequenceGeneratorService {

    private final MongoOperations mongoOperations;

    public SequenceGeneratorService(MongoOperations mongoOperations) {
        this.mongoOperations = mongoOperations;
    }

    public long nextId(String sequenceName) {
        Query query = Query.query(Criteria.where("_id").is(sequenceName));
        Update update = new Update().inc("seq", 1);
        FindAndModifyOptions options = FindAndModifyOptions.options().returnNew(true).upsert(true);

        Document counter = mongoOperations.findAndModify(query, update, options, Document.class, "database_sequences");
        Number sequence = counter == null ? 1L : counter.get("seq", Number.class);
        return sequence.longValue();
    }
}
