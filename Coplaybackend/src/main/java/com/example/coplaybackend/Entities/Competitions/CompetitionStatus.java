package com.example.coplaybackend.Entities.Competitions;

/**
 * Deprecated: use com.example.coplaybackend.Entities.Competitions.Enums.CompetitionStatus instead.
 */
@Deprecated
public enum CompetitionStatus {
    CREATED,
    CALENDAR_GENERATED,
    IN_PROGRESS,
    FINISHED;

    public com.example.coplaybackend.Entities.Competitions.Enums.CompetitionStatus toNew() {
        return com.example.coplaybackend.Entities.Competitions.Enums.CompetitionStatus.valueOf(this.name());
    }
}
