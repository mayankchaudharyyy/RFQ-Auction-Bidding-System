package com.gocomet.auction.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Document(collection = "auction_configs")
public class AuctionConfig implements SequenceEntity {

    @Id
    private String id;

    @Field("rfq_id")
    private String rfqId;

    @Field("trigger_window_minutes")
    private Integer triggerWindowMinutes;

    @Field("extension_duration_minutes")
    private Integer extensionDurationMinutes;

    @Field("extension_trigger")
    private String extensionTrigger;
}
