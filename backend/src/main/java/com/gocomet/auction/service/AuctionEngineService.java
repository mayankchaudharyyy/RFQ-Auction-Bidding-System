package com.gocomet.auction.service;

import com.gocomet.auction.model.AuctionConfig;
import com.gocomet.auction.model.AuctionLog;
import com.gocomet.auction.model.Bid;
import com.gocomet.auction.model.Rfq;
import com.gocomet.auction.repository.AuctionConfigRepository;
import com.gocomet.auction.repository.AuctionLogRepository;
import com.gocomet.auction.repository.BidRepository;
import com.gocomet.auction.repository.RfqRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuctionEngineService {

    private final RfqRepository rfqRepository;
    private final AuctionConfigRepository auctionConfigRepository;
    private final BidRepository bidRepository;
    private final AuctionLogRepository auctionLogRepository;

    public void processAuctionExtension(String rfqId, String newBidId) {
        try {
            Rfq rfq = rfqRepository.findById(rfqId).orElse(null);
            if (rfq == null || !"active".equals(rfq.getStatus())) return;

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime bidCloseTime = rfq.getBidCloseTime();
            LocalDateTime forcedCloseTime = rfq.getForcedCloseTime();

            // If already past forced close time, force close and stop
            if (now.isAfter(forcedCloseTime) || now.isEqual(forcedCloseTime)) {
                rfq.setStatus("force_closed");
                rfqRepository.save(rfq);

                AuctionLog auctionLog = new AuctionLog();
                auctionLog.setRfqId(rfqId);
                auctionLog.setEventType("force_closed");
                auctionLog.setDescription("Auction force closed - reached forced close time");
                auctionLogRepository.save(auctionLog);
                return;
            }

            AuctionConfig config = auctionConfigRepository.findByRfqId(rfqId).orElse(null);
            if (config == null) return;

            long triggerWindowMinutes = config.getTriggerWindowMinutes();
            long extensionMinutes = config.getExtensionDurationMinutes();

            // Check if bid was placed within trigger window
            LocalDateTime windowStart = bidCloseTime.minusMinutes(triggerWindowMinutes);
            boolean isInTriggerWindow = (now.isAfter(windowStart) || now.isEqual(windowStart)) &&
                                        (now.isBefore(bidCloseTime) || now.isEqual(bidCloseTime));

            if (!isInTriggerWindow) return;

            boolean shouldExtend = false;
            String extensionReason = "";

            if ("bid_received".equals(config.getExtensionTrigger())) {
                shouldExtend = true;
                extensionReason = "New bid received within last " + triggerWindowMinutes + " minutes";
            } else if ("any_rank_change".equals(config.getExtensionTrigger())) {
                if (checkIfRankChanged(rfqId, newBidId)) {
                    shouldExtend = true;
                    extensionReason = "Supplier ranking changed within last " + triggerWindowMinutes + " minutes";
                }
            } else if ("l1_rank_change".equals(config.getExtensionTrigger())) {
                if (checkIfL1Changed(rfqId, newBidId)) {
                    shouldExtend = true;
                    extensionReason = "L1 (lowest bidder) changed within last " + triggerWindowMinutes + " minutes";
                }
            }

            if (!shouldExtend) return;

            // Calculate new close time
            LocalDateTime newCloseTime = bidCloseTime.plusMinutes(extensionMinutes);

            // NEVER exceed forced close time
            if (newCloseTime.isAfter(forcedCloseTime)) {
                newCloseTime = forcedCloseTime;
            }

            LocalDateTime oldCloseTime = bidCloseTime;

            // Update bid_close_time
            rfq.setBidCloseTime(newCloseTime);
            rfqRepository.save(rfq);

            // Log extension
            AuctionLog logExt = new AuctionLog();
            logExt.setRfqId(rfqId);
            logExt.setEventType("time_extended");
            logExt.setDescription(extensionReason);
            logExt.setOldCloseTime(oldCloseTime);
            logExt.setNewCloseTime(newCloseTime);
            logExt.setTriggeredByBidId(newBidId);
            auctionLogRepository.save(logExt);

            log.info("Auction {} extended from {} to {}", rfqId, oldCloseTime, newCloseTime);

        } catch (Exception e) {
            log.error("auctionEngine error:", e);
        }
    }

    private boolean checkIfRankChanged(String rfqId, String newBidId) {
        Bid newBid = bidRepository.findById(newBidId).orElse(null);
        if (newBid == null || newBid.getTotalAmount() == null) return false;

        long lowerCount = bidRepository.countByRfqIdAndTotalAmountLessThanAndIdNot(rfqId, newBid.getTotalAmount(), newBidId);
        long total = bidRepository.countByRfqId(rfqId);

        return lowerCount < (total - 1);
    }

    private boolean checkIfL1Changed(String rfqId, String newBidId) {
        Bid newBid = bidRepository.findById(newBidId).orElse(null);
        if (newBid == null || newBid.getTotalAmount() == null) return false;

        Double prevL1 = bidRepository.findMinAmountByRfqIdExcludingBidId(rfqId, newBidId);

        if (prevL1 == null) return false; // first bid ever
        return newBid.getTotalAmount() < prevL1;
    }
}
