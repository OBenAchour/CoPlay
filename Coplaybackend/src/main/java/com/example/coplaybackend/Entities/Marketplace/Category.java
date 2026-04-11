package com.example.coplaybackend.Entities.Marketplace;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Entité pour les catégories du marketplace
 * Permet une gestion dynamique des catégories
 */
@Document(collection = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    private String categoryId;

    /**
     * Nom unique de la catégorie
     */
    @Indexed(unique = true)
    private String name;

    /**
     * Description de la catégorie
     */
    private String description;

    /**
     * Icône/emoji pour l'affichage
     */
    private String icon;

    /**
     * Ordre d'affichage
     */
    private Integer displayOrder;

    /**
     * Statut actif/inactif
     */
    @Builder.Default
    private Boolean active = true;
}
