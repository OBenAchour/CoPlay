package com.example.coplaybackend.Entities.Marketplace;

public enum ListingStatus {
    /**
     * Annonce active et visible dans le marketplace
     */
    ACTIVE,

    /**
     * Annonce réservée par un acheteur
     */
    RESERVED,

    /**
     * Annonce expirée (plus de 90 jours)
     */
    EXPIRED,

    /**
     * Annonce clôturée (transaction terminée)
     */
    CLOSED
}
