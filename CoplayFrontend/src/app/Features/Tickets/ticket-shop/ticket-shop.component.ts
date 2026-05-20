import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { Ticket } from '../../../Core/Models/Competitions/Ticket';

@Component({
  selector: 'app-ticket-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-shop.component.html',
  styleUrls: ['./ticket-shop.component.css']
})
export class TicketShopComponent implements OnInit {

  matchId = '';
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  selectedCategory = '';
  selectedTicket: Ticket | null = null;

  loading = false;
  buying = false;
  successMessage = '';
  errorMessage = '';

  // ✅ Email récupéré depuis AuthService
  currentUserEmail = '';

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.matchId = this.route.snapshot.paramMap.get('matchId') || '';
    // ✅ Récupère l'email de l'utilisateur connecté
    this.currentUserEmail = this.authService.getUserEmail() || '';
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.ticketService.getAvailableTickets(this.matchId).subscribe({
      next: (data: Ticket[]) => {
        this.tickets = data;
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.selectedTicket = null;
    this.filteredTickets = this.tickets.filter(t => t.category === cat);
  }

  selectTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
  }

  countByCategory(cat: string): number {
    return this.tickets.filter(t => t.category === cat).length;
  }

  getPriceByCategory(cat: string): number {
    const found = this.tickets.find(t => t.category === cat);
    return found ? found.price : 0;
  }

 confirmBuy(): void {
    if (!this.selectedTicket) return;
    this.buying = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.ticketService.buyTicket({
      ticketId: this.selectedTicket.id,
      buyerEmail: this.currentUserEmail   // ✅ email au lieu de userId
    }).subscribe({
      next: () => {
        this.successMessage =
          `🎉 Ticket ${this.selectedTicket?.seatNumber} acheté avec succès !`;
        this.buying = false;
        this.selectedTicket = null;
        this.loadTickets();
      },
      error: (err: unknown) => {
        console.error(err);
        this.errorMessage = "Erreur lors de l'achat. Réessayez.";
        this.buying = false;
      }
    });
  }
}