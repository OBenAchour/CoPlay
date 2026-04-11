package com.example.coplaybackend.Entities.Marketplace;

public enum ListingType {
    /**
     * Vente d'équipement
     * Commission : 5%
     */
    SALE,

    /**
     * Location d'équipement
     * Commission : 10%
     */
    RENTAL,

    /**
     * Service (coach, arbitre, etc.)
     * Commission : 15%
     */
    SERVICE
}
