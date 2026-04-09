package com.example.coplaybackend.Services.Auth;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendTempPassword(String to, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("hsanmannaa4@gmail.com"); // Doit être le même que spring.mail.username
        message.setTo(to);
        message.setSubject("CoPlay - Récupération de votre mot de passe");
        message.setText("Bonjour,\n\nVotre mot de passe temporaire est : " + tempPassword +
                "\n\nConnectez-vous avec ce code, puis changez-le dans votre profil.\n\nL'équipe CoPlay");

        mailSender.send(message);
    }
}