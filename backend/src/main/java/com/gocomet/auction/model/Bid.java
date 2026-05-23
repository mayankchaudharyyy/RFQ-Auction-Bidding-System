package com.gocomet.auction.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@Document(collection = "bids")
public class Bid implements SequenceEntity {

    @Id
    private String id;

    @Field("rfq_id")
    private String rfqId;

    @Field("supplier_id")
    private String supplierId;

    @Field("carrier_name")
    private String carrierName;

    @Field("freight_charges")
    private Double freightCharges;

    @Field("origin_charges")
    private Double originCharges = 0.0;

    @Field("destination_charges")
    private Double destinationCharges = 0.0;

    @Field("transit_time")
    private String transitTime;

    @Field("quote_validity")
    private String quoteValidity;

    @Transient
    private Double totalAmount;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    public Double getTotalAmount() {
        double freight = freightCharges != null ? freightCharges : 0.0;
        double origin = originCharges != null ? originCharges : 0.0;
        double destination = destinationCharges != null ? destinationCharges : 0.0;
        return freight + origin + destination;
    }
}
