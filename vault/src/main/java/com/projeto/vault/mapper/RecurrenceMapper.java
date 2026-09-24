package com.projeto.vault.mapper;

import com.projeto.vault.dto.response.RecurrenceResponse;
import com.projeto.vault.entity.Recurrence;
import org.springframework.stereotype.Component;

/**
 * Mapper de conversão entre {@link Recurrence} e seus DTOs.
 */
@Component
public class RecurrenceMapper {

    public RecurrenceResponse toResponse(Recurrence recurrence) {
        if (recurrence == null) {
            return null;
        }
        return RecurrenceResponse.builder()
                .id(recurrence.getId())
                .description(recurrence.getDescription())
                .amount(recurrence.getAmount())
                .type(recurrence.getType() != null ? recurrence.getType().name() : null)
                .frequency(recurrence.getFrequency() != null ? recurrence.getFrequency().name() : null)
                .startDate(recurrence.getStartDate())
                .endDate(recurrence.getEndDate())
                .active(recurrence.getActive())
                .accountId(recurrence.getAccount() != null ? recurrence.getAccount().getId() : null)
                .accountName(recurrence.getAccount() != null ? recurrence.getAccount().getName() : null)
                .categoryId(recurrence.getCategory() != null ? recurrence.getCategory().getId() : null)
                .categoryName(recurrence.getCategory() != null ? recurrence.getCategory().getName() : null)
                .createdAt(recurrence.getCreatedAt())
                .build();
    }
}
