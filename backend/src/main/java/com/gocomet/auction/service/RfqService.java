package com.gocomet.auction.service;

import com.gocomet.auction.dto.Dto.*;
import com.gocomet.auction.model.AuctionConfig;
import com.gocomet.auction.model.Rfq;
import com.gocomet.auction.model.User;
import com.gocomet.auction.repository.AuctionConfigRepository;
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
public class RfqService {

    private final RfqRepository rfqRepository;
    private final AuctionConfigRepository auctionConfigRepository;
    private final UserRepository userRepository;
    private final BidRepository bidRepository;
    private final AuctionLogRepository auctionLogRepository;
    private final SequenceGeneratorService sequenceGeneratorService;

    public Map<String, Object> createRfq(RfqCreateRequest request) {
        if (request.getForced_close_time().isBefore(request.getBid_close_time()) || request.getForced_close_time().isEqual(request.getBid_close_time())) {
            throw new IllegalArgumentException("forced_close_time must be greater than bid_close_time");
        }
        if (request.getBid_close_time().isBefore(request.getBid_start_time()) || request.getBid_close_time().isEqual(request.getBid_start_time())) {
            throw new IllegalArgumentException("bid_close_time must be greater than bid_start_time");
        }

        String referenceId = generateReferenceId();

        Rfq rfq = new Rfq();
        rfq.setReferenceId(referenceId);
        rfq.setName(request.getName());
        rfq.setBuyerId(request.getBuyer_id());
        rfq.setPickupServiceDate(request.getPickup_service_date());
        rfq.setBidStartTime(request.getBid_start_time());
        rfq.setBidCloseTime(request.getBid_close_time());
        rfq.setForcedCloseTime(request.getForced_close_time());
        rfq.setStatus("draft");

        Rfq savedRfq = rfqRepository.save(rfq);

        AuctionConfig config = new AuctionConfig();
        config.setRfqId(savedRfq.getId());
        config.setTriggerWindowMinutes(request.getTrigger_window_minutes());
        config.setExtensionDurationMinutes(request.getExtension_duration_minutes());
        config.setExtensionTrigger(request.getExtension_trigger());

        auctionConfigRepository.save(config);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "RFQ created successfully");
        response.put("rfq_id", savedRfq.getId());
        response.put("reference_id", referenceId);
        return response;
    }

    private String generateReferenceId() {
        int year = LocalDateTime.now().getYear();
        long nextNumber = sequenceGeneratorService.nextId("rfq_reference_" + year);
        return String.format("RFQ-%d-%03d", year, nextNumber);
    }

    public List<RfqListingResponse> getAllRfqs() {
        return rfqRepository.findAllByOrderByCreatedAtDesc().stream().map(rfq -> {
            RfqListingResponse dto = new RfqListingResponse();
            dto.setId(rfq.getId());
            dto.setReference_id(rfq.getReferenceId());
            dto.setName(rfq.getName());
            dto.setStatus(rfq.getStatus());
            dto.setBid_close_time(rfq.getBidCloseTime());
            dto.setForced_close_time(rfq.getForcedCloseTime());
            dto.setCurrent_lowest_bid(bidRepository.findMinAmountByRfqId(rfq.getId()));
            dto.setTotal_bids(bidRepository.countByRfqId(rfq.getId()));
            return dto;
        }).collect(Collectors.toList());
    }

    public RfqDetailResponse getRfqById(String id) {
        Rfq rfq = rfqRepository.findById(id).orElseThrow(() -> new RuntimeException("RFQ not found"));
        User buyer = userRepository.findById(rfq.getBuyerId()).orElse(new User());
        AuctionConfig config = auctionConfigRepository.findByRfqId(id).orElse(null);

        AtomicInteger rankCounter = new AtomicInteger(1);
        List<BidWithSupplier> bids = bidRepository.findLatestBidsPerSupplierByRfqIdSorted(id).stream().map(bid -> {
            BidWithSupplier dto = new BidWithSupplier();
            dto.setBid(bid);
            dto.setSupplierName(userRepository.findById(bid.getSupplierId()).map(User::getName).orElse(null));
            dto.setRanking(rankCounter.getAndIncrement());
            return dto;
        }).collect(Collectors.toList());

        RfqWithBuyer rfqWithBuyer = new RfqWithBuyer();
        rfqWithBuyer.setRfq(rfq);
        rfqWithBuyer.setBuyerName(buyer.getName());

        RfqDetailResponse response = new RfqDetailResponse();
        response.setRfq(rfqWithBuyer);
        response.setAuctionConfig(config);
        response.setBids(bids);
        response.setActivityLog(auctionLogRepository.findAllByRfqIdOrderByCreatedAtAsc(id));
        return response;
    }
}
