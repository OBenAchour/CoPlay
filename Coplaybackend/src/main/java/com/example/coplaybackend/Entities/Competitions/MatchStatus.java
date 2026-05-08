package com.example.coplaybackend.Entities.Competitions;

/**
 * Deprecated: use com.example.coplaybackend.Entities.Competitions.Enums.MatchStatus instead.
 * This enum is kept temporairement pour compatibilité mais sera supprimé plus tard.
 */
@Deprecated
public enum MatchStatus {
    SCHEDULED,
    LIVE,
    FINISHED,
    CANCELLED;

    public com.example.coplaybackend.Entities.Competitions.Enums.MatchStatus toNew() {
        return com.example.coplaybackend.Entities.Competitions.Enums.MatchStatus.valueOf(this.name());
    }
}
