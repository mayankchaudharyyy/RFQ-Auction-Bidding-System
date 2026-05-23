package com.gocomet.auction.dto;

import com.gocomet.auction.model.AuctionConfig;
import com.gocomet.auction.model.AuctionLog;
import com.gocomet.auction.model.Bid;
import com.gocomet.auction.model.Rfq;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

public class Dto {

    @Data
    public static class RfqCreateRequest {
        private String name;
        private String buyer_id;
        private String pickup_service_date;
        private LocalDateTime bid_start_time;
        private LocalDateTime bid_close_time;
        private LocalDateTime forced_close_time;
        private Integer trigger_window_minutes;
        private Integer extension_duration_minutes;
        private String extension_trigger;
    }

    @Data
    public static class RfqListingResponse {
        private String id;
        private String reference_id;
        private String name;
        private String status;
        private LocalDateTime bid_close_time;
        private LocalDateTime forced_close_time;
        private Double current_lowest_bid;
        private Long total_bids; // Used for auction listing
    }

    @Data
    public static class RfqWithBuyer {
        @com.fasterxml.jackson.annotation.JsonUnwrapped
        private Rfq rfq;
        private String buyerName;
    }

    @Data
    public static class RfqDetailResponse {
        private RfqWithBuyer rfq;
        private AuctionConfig auctionConfig;
        private List<BidWithSupplier> bids;
        private List<AuctionLog> activityLog;
    }

    @Data
    public static class BidWithSupplier {
        @com.fasterxml.jackson.annotation.JsonUnwrapped
        private Bid bid;
        private String supplierName;
        private Integer ranking;
    }

    @Data
    public static class BidSubmitRequest {
        private String rfq_id;
        private String supplier_id;
        private String carrier_name;
        private Double freight_charges;
        private Double origin_charges;
        private Double destination_charges;
        private String transit_time;
        private String quote_validity;
    }
}
