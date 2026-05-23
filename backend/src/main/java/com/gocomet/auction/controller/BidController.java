package com.gocomet.auction.controller;

import com.gocomet.auction.dto.Dto.*;
import com.gocomet.auction.service.BidService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BidController {

    private final BidService bidService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitBid(@RequestBody BidSubmitRequest request) {
        try {
            Map<String, Object> response = bidService.submitBid(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

    @GetMapping("/{rfq_id}")
    public ResponseEntity<?> getBidsByRfq(@PathVariable("rfq_id") String rfqId) {
        try {
            List<BidWithSupplier> response = bidService.getBidsByRfq(rfqId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }
}
