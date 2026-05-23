package com.gocomet.auction.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User implements SequenceEntity {
    
    @Id
    private String id;
    
    private String name;
}
