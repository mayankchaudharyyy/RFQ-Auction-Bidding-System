package com.gocomet.auction.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@Document(collection = "rfqs")
public class Rfq implements SequenceEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("reference_id")
    private String referenceId;

    private String name;

    @Field("buyer_id")
    private String buyerId;

    @Field("pickup_service_date")
    private String pickupServiceDate;

    @Field("bid_start_time")
    private LocalDateTime bidStartTime;

    @Field("bid_close_time")
    private LocalDateTime bidCloseTime;

    @Field("forced_close_time")
    private LocalDateTime forcedCloseTime;

    private String status;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
}
