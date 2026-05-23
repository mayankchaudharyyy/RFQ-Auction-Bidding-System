package com.gocomet.auction.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@Document(collection = "auction_logs")
public class AuctionLog implements SequenceEntity {

    @Id
    private String id;

    @Field("rfq_id")
    private String rfqId;

    @Field("event_type")
    private String eventType;

    private String description;

    @Field("old_close_time")
    private LocalDateTime oldCloseTime;

    @Field("new_close_time")
    private LocalDateTime newCloseTime;

    @Field("triggered_by_bid_id")
    private String triggeredByBidId;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
}
