package com.gocomet.auction.controller;

import com.gocomet.auction.dto.Dto.RfqListingResponse;
import com.gocomet.auction.service.AuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuctionController {

    private final AuctionService auctionService;

    @PostMapping("/activate/{rfq_id}")
    public ResponseEntity<?> activateAuction(@PathVariable("rfq_id") String rfqId) {
        try {
            Map<String, Object> response = auctionService.activateAuction(rfqId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage().equals("RFQ not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/close/{rfq_id}")
    public ResponseEntity<?> closeAuction(@PathVariable("rfq_id") String rfqId) {
        try {
            Map<String, Object> response = auctionService.closeAuction(rfqId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage().equals("RFQ not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/check-status/{rfq_id}")
    public ResponseEntity<?> checkAndUpdateStatus(@PathVariable("rfq_id") String rfqId) {
        try {
            Map<String, Object> response = auctionService.checkAndUpdateStatus(rfqId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("RFQ not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/listing")
    public ResponseEntity<?> getAuctionListing() {
        try {
            List<RfqListingResponse> response = auctionService.getAuctionListing();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }
}
