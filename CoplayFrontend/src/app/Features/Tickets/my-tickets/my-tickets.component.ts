import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { Ticket } from '../../../Core/Models/Competitions/Ticket';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-tickets.component.html',
  styleUrls: ['./my-tickets.component.css']
})
export class MyTicketsComponent implements OnInit {

  tickets: Ticket[] = [];
  loading = false;
  ticketToPrint: Ticket | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // ✅ Utilise l'email (présent dans le token JWT)
    const email = this.authService.getUserEmail() || '';
    this.loadMyTickets(email);
  }

  loadMyTickets(email: string): void {
    this.loading = true;
    this.ticketService.getMyTickets(email).subscribe({
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

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'VIP':     return '👑';
      case 'TRIBUNE': return '🏟️';
      case 'PELOUSE': return '⚽';
      default:        return '🎟️';
    }
  }

  getHeaderClass(category: string): string {
    switch (category) {
      case 'VIP':     return 'header-vip';
      case 'TRIBUNE': return 'header-tribune';
      case 'PELOUSE': return 'header-pelouse';
      default:        return 'header-pelouse';
    }
  }

  printTicket(ticket: Ticket): void {
    this.ticketToPrint = ticket;
    setTimeout(() => {
      const printZone = document.getElementById('print-zone');
      if (printZone) printZone.style.display = 'block';
      window.print();
      setTimeout(() => {
        if (printZone) printZone.style.display = 'none';
        this.ticketToPrint = null;
      }, 500);
    }, 300);
  }
}