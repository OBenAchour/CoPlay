import { Component, OnInit } from '@angular/core';
import { ReclamationService } from '../../services/reclamation.service';
import { Reclamation } from '../../Core/Models/Reclamation';

@Component({
  selector: 'app-admin-reclamation',
  templateUrl: './admin-reclamation.component.html',
  styleUrls: ['./admin-reclamation.component.css']
})
export class AdminReclamationComponent implements OnInit {
  reclamations: Reclamation[] = [];
  reclamationsFiltrees: Reclamation[] = [];
  filtreStatut: 'toutes' | 'traitee' | 'en_attente' = 'toutes';
  recherche = '';
  chargement = true;
  erreur = false;

  constructor(private reclamationService: ReclamationService) {}

  ngOnInit(): void {
    this.chargerReclamations();
  }

  chargerReclamations(): void {
    this.chargement = true;
    this.reclamationService.getReclamations().subscribe({
      next: (data) => {
        // Tri : plus récentes en premier
        this.reclamations = data.sort((a, b) =>
          new Date(b.dateCreation!).getTime() - new Date(a.dateCreation!).getTime()
        );
        this.appliquerFiltres();
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur chargement', err);
        this.erreur = true;
        this.chargement = false;
      }
    });
  }

  appliquerFiltres(): void {
    this.reclamationsFiltrees = this.reclamations.filter(r => {
      const matchStatut =
        this.filtreStatut === 'toutes' ||
        (this.filtreStatut === 'traitee' && r.traitee) ||
        (this.filtreStatut === 'en_attente' && !r.traitee);

      const term = this.recherche.toLowerCase();
      const matchRecherche =
        !term ||
        r.nomComplet.toLowerCase().includes(term) ||
        r.objet.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term);

      return matchStatut && matchRecherche;
    });
  }

  marquerTraitee(id: string): void {
    this.reclamationService.marquerTraitee(id).subscribe({
      next: () => {
        const rec = this.reclamations.find(r => r.id === id);
        if (rec) rec.traitee = true;
        this.appliquerFiltres();
      },
      error: (err) => console.error('Erreur traitement', err)
    });
  }

  supprimer(id: string): void {
    if (!confirm('Supprimer définitivement cette réclamation ?')) return;
    this.reclamationService.supprimer(id).subscribe({
      next: () => {
        this.reclamations = this.reclamations.filter(r => r.id !== id);
        this.appliquerFiltres();
      },
      error: (err) => console.error('Erreur suppression', err)
    });
  }

  get nbEnAttente(): number {
    return this.reclamations.filter(r => !r.traitee).length;
  }

  get nbTraitees(): number {
    return this.reclamations.filter(r => r.traitee).length;
  }
}