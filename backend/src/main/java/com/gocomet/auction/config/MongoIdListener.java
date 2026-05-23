package com.gocomet.auction.config;

import com.gocomet.auction.model.SequenceEntity;
import com.gocomet.auction.service.SequenceGeneratorService;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.stereotype.Component;

@Component
public class MongoIdListener extends AbstractMongoEventListener<SequenceEntity> {

    private final SequenceGeneratorService sequenceGeneratorService;

    public MongoIdListener(SequenceGeneratorService sequenceGeneratorService) {
        this.sequenceGeneratorService = sequenceGeneratorService;
    }

    @Override
    public void onBeforeConvert(BeforeConvertEvent<SequenceEntity> event) {
        SequenceEntity entity = event.getSource();
        if (entity.getId() == null) {
            entity.setId(String.valueOf(sequenceGeneratorService.nextId(event.getCollectionName())));
        }
    }
}
