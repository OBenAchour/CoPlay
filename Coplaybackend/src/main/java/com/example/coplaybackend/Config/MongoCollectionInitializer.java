package com.example.coplaybackend.Config;


import com.example.coplaybackend.Entities.Auth.AuditLog;
import com.example.coplaybackend.Entities.Auth.RefreshToken;
import com.example.coplaybackend.Entities.Auth.User;
import com.example.coplaybackend.Entities.Auth.UserProfile;
import com.example.coplaybackend.Entities.Social.Comment;
import com.example.coplaybackend.Entities.Social.Like;
import com.example.coplaybackend.Entities.Social.Post;
import com.example.coplaybackend.Entities.Teams.*;
import com.example.coplaybackend.Entities.Events.Event;
import com.example.coplaybackend.Entities.Events.Location;
import com.example.coplaybackend.Entities.Events.TrainingProgram;
import com.example.coplaybackend.Entities.Competitions.*;
import com.example.coplaybackend.Entities.Marketplace.Equipment;
import com.example.coplaybackend.Entities.Marketplace.MarketplaceService;
import com.example.coplaybackend.Entities.Marketplace.Review;
import com.example.coplaybackend.Entities.Messaging.Conversation;
import com.example.coplaybackend.Entities.Messaging.Message;
import com.example.coplaybackend.Entities.Messaging.MessageMedia;
import com.example.coplaybackend.Entities.Messaging.Participant;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MongoCollectionInitializer implements CommandLineRunner {

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) {

        // ── M1 AUTH ──────────────────────────────────────────────
        createIfNotExists(User.class);
        createIfNotExists(UserProfile.class);
        createIfNotExists(RefreshToken.class);
        createIfNotExists(AuditLog.class);

        // ── M2 SOCIAL ────────────────────────────────────────────
        createIfNotExists(Post.class);
        createIfNotExists(Comment.class);
        createIfNotExists(Like.class);

        // ── M3 MESSAGING ─────────────────────────────────────────
        createIfNotExists(Conversation.class);
        createIfNotExists(Participant.class);
        createIfNotExists(Message.class);
        createIfNotExists(MessageMedia.class);

        // ── M4 TEAMS ─────────────────────────────────────────────
        createIfNotExists(Team.class);
        createIfNotExists(TeamMember.class);
        createIfNotExists(DemandeAdhesion.class);
        createIfNotExists(Invitation.class);
        createIfNotExists(PropositionCoach.class);
        createIfNotExists(HistoriqueAction.class);
        createIfNotExists(EquipeSponsor.class);

        // ── M5 EVENTS & TRAINING ─────────────────────────────────
        createIfNotExists(Event.class);
        createIfNotExists(Location.class);
        createIfNotExists(TrainingProgram.class);

        // ── M6 COMPETITIONS ──────────────────────────────────────
        // Competition est abstract → on crée via Tournoi et Ligue
        createIfNotExists(Tournoi.class);
        createIfNotExists(Ligue.class);
        createIfNotExists(MatchCompetition.class);
        createIfNotExists(Classement.class);
        createIfNotExists(StatistiqueEquipe.class);

        // ── M7 MARKETPLACE ───────────────────────────────────────
        createIfNotExists(Equipment.class);
        createIfNotExists(MarketplaceService.class);
        createIfNotExists(Review.class);

        System.out.println("✅ Toutes les collections MongoDB sont prêtes.");
    }

    private void createIfNotExists(Class<?> clazz) {
        String collectionName = mongoTemplate.getCollectionName(clazz);
        if (!mongoTemplate.collectionExists(collectionName)) {
            mongoTemplate.createCollection(collectionName);
            System.out.println("📦 Collection créée : " + collectionName);
        } else {
            System.out.println("✔  Collection existante : " + collectionName);
        }
    }
}
