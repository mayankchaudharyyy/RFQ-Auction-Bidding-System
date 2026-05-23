package com.gocomet.auction.service;

import com.gocomet.auction.dto.Dto.*;
import com.gocomet.auction.model.AuctionLog;
import com.gocomet.auction.model.Bid;
import com.gocomet.auction.model.Rfq;
import com.gocomet.auction.model.User;
import com.gocomet.auction.repository.AuctionLogRepository;
import com.gocomet.auction.repository.BidRepository;
import com.gocomet.auction.repository.RfqRepository;
import com.gocomet.auction.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final RfqRepository rfqRepository;
    private final AuctionLogRepository auctionLogRepository;
    private final AuctionEngineService auctionEngineService;
    private final UserRepository userRepository;

    public Map<String, Object> submitBid(BidSubmitRequest request) {
        Rfq rfq = rfqRepository.findById(request.getRfq_id())
                .orElseThrow(() -> new RuntimeException("RFQ not found"));

        LocalDateTime now = LocalDateTime.now();

        if (!"active".equals(rfq.getStatus())) {
            throw new IllegalArgumentException("Auction is " + rfq.getStatus() + ". Bids not accepted.");
        }
        if (now.isBefore(rfq.getBidStartTime())) {
            throw new IllegalArgumentException("Auction has not started yet");
        }
        if (now.isAfter(rfq.getForcedCloseTime())) {
            throw new IllegalArgumentException("Auction is past forced close time");
        }
        if (now.isAfter(rfq.getBidCloseTime())) {
            throw new IllegalArgumentException("Auction bid time has closed");
        }

        Bid bid = new Bid();
        bid.setRfqId(request.getRfq_id());
        bid.setSupplierId(request.getSupplier_id());
        bid.setCarrierName(request.getCarrier_name());
        bid.setFreightCharges(request.getFreight_charges());
        bid.setOriginCharges(request.getOrigin_charges() != null ? request.getOrigin_charges() : 0.0);
        bid.setDestinationCharges(request.getDestination_charges() != null ? request.getDestination_charges() : 0.0);
        bid.setTransitTime(request.getTransit_time());
        bid.setQuoteValidity(request.getQuote_validity());

        Bid savedBid = bidRepository.save(bid);

        AuctionLog log = new AuctionLog();
        log.setRfqId(rfq.getId());
        log.setEventType("bid_submitted");
        log.setDescription("Bid submitted by supplier_id " + request.getSupplier_id());
        log.setTriggeredByBidId(savedBid.getId());
        auctionLogRepository.save(log);

        auctionEngineService.processAuctionExtension(rfq.getId(), savedBid.getId());

        // Fetch updated RFQ
        Rfq updatedRfq = rfqRepository.findById(rfq.getId()).orElse(rfq);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Bid submitted successfully");
        response.put("bid_id", savedBid.getId());
        response.put("current_bid_close_time", updatedRfq.getBidCloseTime());
        response.put("forced_close_time", updatedRfq.getForcedCloseTime());
        return response;
    }

    public List<BidWithSupplier> getBidsByRfq(String rfqId) {
        AtomicInteger rankCounter = new AtomicInteger(1);
        return bidRepository.findLatestBidsPerSupplierByRfqIdSorted(rfqId).stream().map(bid -> {
            BidWithSupplier dto = new BidWithSupplier();
            dto.setBid(bid);
            dto.setSupplierName(userRepository.findById(bid.getSupplierId()).map(User::getName).orElse(null));
            dto.setRanking(rankCounter.getAndIncrement());
            return dto;
        }).collect(Collectors.toList());
    }
}
