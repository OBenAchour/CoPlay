package com.example.coplaybackend.Services.Marketplace;

import com.example.coplaybackend.Entities.Marketplace.Category;
import com.example.coplaybackend.Repositories.Marketplace.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

/**
 * Service pour la gestion des catégories du marketplace
 */
@Service
@RequiredArgsConstructor
public class CategoryService implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    /**
     * Récupère toutes les catégories actives
     */
    public List<Category> getActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    /**
     * Récupère une catégorie par son nom
     */
    public Category getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }

    /**
     * Crée une nouvelle catégorie
     */
    public Category createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Une catégorie avec ce nom existe déjà");
        }
        return categoryRepository.save(category);
    }

    /**
     * Initialise les catégories par défaut au démarrage de l'application
     */
    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            initializeDefaultCategories();
            System.out.println("✅ Catégories par défaut initialisées");
        }
    }

    /**
     * Crée les catégories par défaut pour le marketplace sportif
     */
    private void initializeDefaultCategories() {
        List<Category> defaultCategories = Arrays.asList(
            Category.builder()
                .name("FOOTBALL")
                .description("Tout pour le football : ballons, maillots, crampons...")
                .icon("⚽")
                .displayOrder(1)
                .active(true)
                .build(),

            Category.builder()
                .name("BASKETBALL")
                .description("Basketball : ballons, baskets, maillots...")
                .icon("🏀")
                .displayOrder(2)
                .active(true)
                .build(),

            Category.builder()
                .name("TENNIS")
                .description("Tennis : raquettes, balles, tenues...")
                .icon("🎾")
                .displayOrder(3)
                .active(true)
                .build(),

            Category.builder()
                .name("NATATION")
                .description("Natation : maillots, bonnets, lunettes...")
                .icon("🏊")
                .displayOrder(4)
                .active(true)
                .build(),

            Category.builder()
                .name("COURSE")
                .description("Course à pied : chaussures, vêtements, accessoires...")
                .icon("🏃")
                .displayOrder(5)
                .active(true)
                .build(),

            Category.builder()
                .name("CYCLISME")
                .description("Cyclisme : vélos, casques, vêtements...")
                .icon("🚴")
                .displayOrder(6)
                .active(true)
                .build(),

            Category.builder()
                .name("GYMNASTIQUE")
                .description("Gymnastique et fitness : tapis, haltères, élastiques...")
                .icon("🤸")
                .displayOrder(7)
                .active(true)
                .build(),

            Category.builder()
                .name("SPORTS COMBATTANTS")
                .description("Arts martiaux, boxe, judo, karaté...")
                .icon("🥊")
                .displayOrder(8)
                .active(true)
                .build(),

            Category.builder()
                .name("SPORTS RAQUETTE")
                .description("Badminton, squash, ping-pong...")
                .icon("🏸")
                .displayOrder(9)
                .active(true)
                .build(),

            Category.builder()
                .name("SERVICES")
                .description("Coaching, arbitrage, entraînement...")
                .icon("👨‍🏫")
                .displayOrder(10)
                .active(true)
                .build(),

            Category.builder()
                .name("ACCESSOIRES")
                .description("Accessoires divers : sacs, gourdes, montres...")
                .icon("🎒")
                .displayOrder(11)
                .active(true)
                .build(),

            Category.builder()
                .name("VÉTEMENTS")
                .description("Vêtements de sport pour tous les sports")
                .icon("👕")
                .displayOrder(12)
                .active(true)
                .build()
        );

        categoryRepository.saveAll(defaultCategories);
    }
}
