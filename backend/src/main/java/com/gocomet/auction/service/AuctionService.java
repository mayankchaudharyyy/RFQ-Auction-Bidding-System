package com.gocomet.auction.service;

import com.gocomet.auction.dto.Dto.RfqListingResponse;
import com.gocomet.auction.model.AuctionLog;
import com.gocomet.auction.model.Rfq;
import com.gocomet.auction.repository.AuctionLogRepository;
import com.gocomet.auction.repository.RfqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final RfqRepository rfqRepository;
    private final AuctionLogRepository auctionLogRepository;
    private final RfqService rfqService;

    public Map<String, Object> activateAuction(String rfqId) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new RuntimeException("RFQ not found"));

        if (!"draft".equals(rfq.getStatus())) {
            throw new IllegalArgumentException("RFQ is already " + rfq.getStatus());
        }

        rfq.setStatus("active");
        rfqRepository.save(rfq);

        AuctionLog log = new AuctionLog();
        log.setRfqId(rfqId);
        log.setEventType("bid_submitted"); // Maintaining exact same event name from node.js
        log.setDescription("Auction activated by buyer");
        auctionLogRepository.save(log);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Auction activated successfully");
        return response;
    }

    public Map<String, Object> closeAuction(String rfqId) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new RuntimeException("RFQ not found"));

        if ("closed".equals(rfq.getStatus()) || "force_closed".equals(rfq.getStatus())) {
            throw new IllegalArgumentException("Auction is already closed");
        }

        rfq.setStatus("closed");
        rfqRepository.save(rfq);

        AuctionLog log = new AuctionLog();
        log.setRfqId(rfqId);
        log.setEventType("auction_closed");
        log.setDescription("Auction manually closed by buyer");
        auctionLogRepository.save(log);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Auction closed successfully");
        return response;
    }

    public Map<String, Object> checkAndUpdateStatus(String rfqId) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new RuntimeException("RFQ not found"));

        LocalDateTime now = LocalDateTime.now();
        Map<String, Object> response = new HashMap<>();

        if (!"active".equals(rfq.getStatus())) {
            response.put("status", rfq.getStatus());
            response.put("message", "No update needed");
            return response;
        }

        LocalDateTime forcedCloseTime = rfq.getForcedCloseTime();
        LocalDateTime bidCloseTime = rfq.getBidCloseTime();

        if (now.isAfter(forcedCloseTime) || now.isEqual(forcedCloseTime)) {
            rfq.setStatus("force_closed");
            rfqRepository.save(rfq);

            AuctionLog log = new AuctionLog();
            log.setRfqId(rfqId);
            log.setEventType("force_closed");
            log.setDescription("Auction force closed - reached forced close time");
            auctionLogRepository.save(log);

            response.put("status", "force_closed");
            response.put("message", "Auction force closed");
            return response;
        }

        if (now.isAfter(bidCloseTime) || now.isEqual(bidCloseTime)) {
            rfq.setStatus("closed");
            rfqRepository.save(rfq);

            AuctionLog log = new AuctionLog();
            log.setRfqId(rfqId);
            log.setEventType("auction_closed");
            log.setDescription("Auction closed - reached bid close time");
            auctionLogRepository.save(log);

            response.put("status", "closed");
            response.put("message", "Auction closed");
            return response;
        }

        long timeRemainingSeconds = java.time.Duration.between(now, bidCloseTime).getSeconds();

        response.put("status", rfq.getStatus());
        response.put("message", "Auction still active");
        response.put("bid_close_time", rfq.getBidCloseTime());
        response.put("forced_close_time", rfq.getForcedCloseTime());
        response.put("time_remaining_seconds", timeRemainingSeconds);
        return response;
    }

    public List<RfqListingResponse> getAuctionListing() {
        return rfqService.getAllRfqs(); // It uses the exact same query in node.js
    }
}
