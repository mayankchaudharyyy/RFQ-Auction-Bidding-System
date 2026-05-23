package com.gocomet.auction.controller;

import com.gocomet.auction.dto.Dto.*;
import com.gocomet.auction.service.RfqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rfqs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RfqController {

    private final RfqService rfqService;

    @PostMapping("/create")
    public ResponseEntity<?> createRfq(@RequestBody RfqCreateRequest request) {
        try {
            Map<String, Object> response = rfqService.createRfq(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllRfqs() {
        try {
            List<RfqListingResponse> response = rfqService.getAllRfqs();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRfqById(@PathVariable String id) {
        try {
            RfqDetailResponse response = rfqService.getRfqById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }
}
