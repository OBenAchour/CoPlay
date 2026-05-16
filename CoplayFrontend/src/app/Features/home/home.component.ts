import { Component } from '@angular/core';
import { ReclamationService } from '../../services/reclamation.service';
import { Reclamation } from '../../Core/Models/Reclamation';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
reclamation: Reclamation = {
    nomComplet: '',
    email: '',
    objet: '',
    message: '',
    traitee: false
  };

  envoiReussi = false;
  envoiErreur = false;
  envoiEnCours = false;

  constructor(private reclamationService: ReclamationService) {}

  envoyerReclamation(): void {
    if (!this.reclamation.nomComplet || !this.reclamation.email ||
        !this.reclamation.objet || !this.reclamation.message) {
      return;
    }

    this.envoiEnCours = true;
    this.envoiReussi = false;
    this.envoiErreur = false;

    this.reclamationService.envoyerReclamation(this.reclamation).subscribe({
      next: () => {
        this.envoiReussi = true;
        this.envoiEnCours = false;
        // Reset du formulaire
        this.reclamation = { nomComplet: '', email: '', objet: '', message: '', traitee: false };
      },
      error: (err) => {
        console.error('Erreur envoi réclamation', err);
        this.envoiErreur = true;
        this.envoiEnCours = false;
      }
    });
  }
}
