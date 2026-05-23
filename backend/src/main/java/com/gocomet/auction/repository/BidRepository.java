package com.gocomet.auction.repository;

import com.gocomet.auction.model.Bid;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Repository
public interface BidRepository extends MongoRepository<Bid, String> {
    
    long countByRfqId(String rfqId);

    List<Bid> findByRfqId(String rfqId);
    
    default long countByRfqIdAndTotalAmountLessThanAndIdNot(String rfqId, Double amount, String excludedBidId) {
        return findByRfqId(rfqId).stream()
                .filter(bid -> !Objects.equals(bid.getId(), excludedBidId))
                .filter(bid -> bid.getTotalAmount() < amount)
                .count();
    }
    
    default Double findMinAmountByRfqIdExcludingBidId(String rfqId, String excludedBidId) {
        return findByRfqId(rfqId).stream()
                .filter(bid -> !Objects.equals(bid.getId(), excludedBidId))
                .map(Bid::getTotalAmount)
                .min(Double::compareTo)
                .orElse(null);
    }

    default Double findMinAmountByRfqId(String rfqId) {
        return findByRfqId(rfqId).stream()
                .map(Bid::getTotalAmount)
                .min(Double::compareTo)
                .orElse(null);
    }
    
    default List<Bid> findLatestBidsPerSupplierByRfqIdSorted(String rfqId) {
        Map<String, Bid> latestBySupplier = findByRfqId(rfqId).stream()
                .collect(Collectors.toMap(
                        Bid::getSupplierId,
                        bid -> bid,
                        (existing, replacement) -> {
                            if (existing.getCreatedAt() == null) return replacement;
                            if (replacement.getCreatedAt() == null) return existing;
                            return replacement.getCreatedAt().isAfter(existing.getCreatedAt()) ? replacement : existing;
                        }
                ));

        return latestBySupplier.values().stream()
                .sorted(Comparator.comparing(Bid::getTotalAmount))
                .collect(Collectors.toList());
    }
}
