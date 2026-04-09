import { Component, Input, OnInit } from '@angular/core';
import { TeamMemberService } from 'src/app/services/TeamMember/team-member.service';
import { TeamMember } from 'src/app/Core/Models/Teams/TeamMember';
import { RoleEquipe } from 'src/app/Core/Models/Teams/RoleEquipe';

@Component({
  selector: 'app-team-member',
  templateUrl: './team-member.component.html',
  styleUrls: ['./team-member.component.css']
})
export class TeamMemberComponent implements OnInit {

  @Input() teamId!: string;  // Requis pour récupérer les membres de l'équipe

  members: TeamMember[] = [];
  loading = false;

  // Pour ajouter un membre
  newUserId = '';
  newRole: RoleEquipe = 'PLAYER'; // valeur par défaut valide
  constructor(private memberService: TeamMemberService) {}

  ngOnInit(): void {
    if(this.teamId) {
      this.loadMembers();
    }
  }

  // 🔹 Charger tous les membres
  loadMembers() {
    this.loading = true;
    this.memberService.getMembers(this.teamId).subscribe({
      next: (data) => {
        this.members = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur getMembers:', err);
        this.loading = false;
      }
    });
  }

  // 🔹 Ajouter un membre
  addMember() {
    if (!this.newUserId) {
      alert('L\'ID utilisateur est requis');
      return;
    }

    this.memberService.addMember(this.teamId, this.newUserId, this.newRole).subscribe({
      next: (member) => {
        console.log('Membre ajouté:', member);
        this.loadMembers();
        this.newUserId = '';
        this.newRole = 'PLAYER';
      },
      error: (err) => console.error('Erreur addMember:', err)
    });
  }

  // 🔹 Supprimer un membre
  removeMember(userId: string) {
    if (!confirm('Voulez-vous vraiment supprimer ce membre ?')) return;

    this.memberService.removeMember(this.teamId, userId).subscribe({
      next: () => this.loadMembers(),
      error: (err) => console.error('Erreur removeMember:', err)
    });
  }
}
