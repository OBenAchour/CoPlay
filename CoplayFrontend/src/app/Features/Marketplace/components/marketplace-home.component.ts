import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MarketplaceService } from '../services/marketplace.service';
import { CoachingService } from '../../Coaching/services/coaching.service';
import { AuthService } from '../../../Core/Services/Auth/auth.service';
import { Equipment } from '../../../Core/Models/Marketplace/Equipment';

@Component({
  selector: 'app-marketplace-home',
  template: `
    <div class="page route-enter">
      <div class="crumb-row">
        <div class="crumb">
          <span>CoPlay</span>
          <span>›</span>
          <span>Marketplace</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
          <div>
            <div class="eyebrow" style="margin-bottom:10px">Marketplace · Sport gear</div>
            <h1 class="display" style="font-size:clamp(40px, 5vw, 72px);margin:0">Trouvez votre matériel</h1>
            <p style="color:var(--muted);max-width:560px;margin:10px 0 0;font-size:15px">
              Achetez, louez, réservez. Équipements premium et prestataires sportifs vérifiés.
            </p>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn-cp btn-ghost-cp" routerLink="/marketplace/my">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 7h12l-1 13H7zM9 7a3 3 0 0 1 6 0"/></svg>
              Mes annonces
            </button>
            <button class="btn-cp btn-ghost-cp" routerLink="/marketplace/orders">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h4"/></svg>
              Commandes
            </button>
            <button class="btn-cp btn-primary-cp" routerLink="/marketplace/equipment/new">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Vendre
            </button>
          </div>
        </div>
      </div>

      <!-- HERO -->
      <div class="full" style="padding-top:24px">
        <section [cpReveal]="0" class="hero hero-grain">
          <div class="orb"></div>
          <div class="hero-grid"></div>
          <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:48px;align-items:center" class="row g-4">
            <div class="col-12 col-lg-7" style="padding:0">
              <div class="badge-cp on-dark">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>
                Alimenté par l'IA
              </div>
              <h1 class="display">Le sport.<br><span style="color:var(--accent)">Sans détour.</span></h1>
              <p class="lede">
                Le seul marketplace qui combine équipement, services pros, et un coach IA personnel.
                Estimation prix automatique, recommandations sur mesure, paiement sécurisé.
              </p>
              <div style="display:flex;gap:12px;margin-top:30px;flex-wrap:wrap">
                <button class="btn-cp btn-primary-cp" routerLink="/marketplace/chatbot">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.6L19 9.5 14.5 12l-.5 5.5L12 14l-2 3.5L9.5 12 5 9.5l5.2-1.9z"/></svg>
                  Demander à l'IA
                </button>
                <button class="btn-cp btn-on-dark-cp" routerLink="/marketplace/cart">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h2l3 12h12l2-9H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
                  Mon panier
                </button>
              </div>
            </div>
            <div class="col-12 col-lg-5 hero-stats" style="padding:0">
              <div class="hero-stat">
                <div class="num"><cp-counter [to]="items.length"></cp-counter></div>
                <div class="lbl">Annonces actives</div>
              </div>
              <div class="hero-stat">
                <div class="num"><cp-counter [to]="recommended.length"></cp-counter></div>
                <div class="lbl">Suggestions IA</div>
              </div>
              <div class="hero-stat">
                <div class="num">24/7</div>
                <div class="lbl">Coach IA</div>
              </div>
              <div class="hero-stat">
                <div class="num"><cp-counter [to]="100" suffix="%"></cp-counter></div>
                <div class="lbl">Paiement sûr</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- SEARCH BAR -->
      <div class="full" style="padding-top:32px">
        <div [cpReveal]="0" class="searchbar">
          <div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input placeholder="Ballon, raquette, kiné, photographe…" [(ngModel)]="q" (keyup.enter)="search()">
          </div>
          <select [(ngModel)]="sport">
            <option value="">Tous sports</option>
            <option>TENNIS</option><option>CYCLING</option><option>FOOTBALL</option>
            <option>FITNESS</option><option>RUNNING</option><option>SWIMMING</option>
          </select>
          <select [(ngModel)]="condition">
            <option value="">État</option>
            <option value="NEW">Neuf</option>
            <option value="USED">Occasion</option>
            <option value="REFURBISHED">Reconditionné</option>
          </select>
          <button class="btn-cp btn-dark-cp" (click)="search()">Rechercher</button>
        </div>
      </div>

      <!-- AI PICKS -->
      <section class="row-section" style="padding-top:calc(var(--row-y) * 0.7);padding-bottom:0">
        <div [cpReveal]="0" style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:24px;gap:24px;flex-wrap:wrap">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
              <span style="width:36px;height:1px;background:var(--ink)"></span>
              <span class="eyebrow">Pour vous · IA</span>
            </div>
            <h2 class="display" style="font-size:48px;margin:0">Sélection personnalisée</h2>
            <p style="color:var(--muted);margin:6px 0 0">Basé sur votre niveau, vos blessures, et votre historique.</p>
          </div>
          <div class="badge-cp">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.6L19 9.5 14.5 12l-.5 5.5L12 14l-2 3.5L9.5 12 5 9.5l5.2-1.9z"/></svg>
            Powered by Groq · Llama 3.1 · &lt;2s
          </div>
        </div>

        <div class="bento">
          <div [cpReveal]="50" class="b-3" *ngIf="recommended[0] as r0">
            <div class="card-cp" style="padding:0;overflow:hidden;display:grid;grid-template-columns:1.1fr 1fr;min-height:380px">
              <div [style.background]="bgImage(r0)"></div>
              <div style="padding:32px;display:flex;flex-direction:column;justify-content:space-between">
                <div>
                  <div class="badge-cp" style="margin-bottom:14px">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.6L19 9.5 14.5 12l-.5 5.5L12 14l-2 3.5L9.5 12 5 9.5l5.2-1.9z"/></svg>
                    Choix IA #1
                  </div>
                  <h3 class="display" style="font-size:42px;margin:0 0 12px">{{ r0.name }}</h3>
                  <p style="color:var(--muted);font-size:14px;line-height:1.55">
                    Match votre niveau {{ labelCondition(r0.condition) || 'intermédiaire' }}. Estimation IA validée. Vendeur certifié, livraison 48h.
                  </p>
                  <div style="margin-top:18px;display:grid;gap:8px">
                    <div *ngFor="let m of matchMetrics" style="display:grid;grid-template-columns:140px 1fr 36px;align-items:center;gap:10px;font-size:12px">
                      <span class="mono" style="color:var(--muted)">{{ m.label }}</span>
                      <div class="bar"><i [style.width]="m.value + '%'"></i></div>
                      <span class="mono" style="text-align:right">{{ m.value }}</span>
                    </div>
                  </div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px">
                  <div class="prod-meta" style="padding:0"><div class="price">{{ r0.price }} €</div></div>
                  <button *ngIf="!isOwner(r0)" class="btn-cp btn-primary-cp" (click)="addToCart(r0)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h2l3 12h12l2-9H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
                    Ajouter
                  </button>
                  <button *ngIf="isOwner(r0)" class="btn-cp btn-ghost-cp" (click)="editListing(r0)">
                    ✏️ Modifier
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div [cpReveal]="120" class="b-1">
            <a class="tile dark" routerLink="/marketplace/chatbot" style="min-height:380px;justify-content:flex-end">
              <div class="tile-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="7" width="16" height="13" rx="3"/><circle cx="9" cy="13" r="1.4" fill="currentColor"/><circle cx="15" cy="13" r="1.4" fill="currentColor"/><path d="M12 3v4M9 17h6"/></svg>
              </div>
              <div style="position:absolute;right:22px;top:22px;display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:11px;color:var(--accent)">
                <span class="live-dot"></span> EN LIGNE
              </div>
              <div style="flex:1"></div>
              <h3>Coach<br>shopping IA</h3>
              <p>Trouvez, comparez, négociez. Llama 3.1 sur Groq. Réponses sous 2 secondes.</p>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
                <span class="chip" style="padding:6px 10px;font-size:11px">Estimer prix</span>
                <span class="chip" style="padding:6px 10px;font-size:11px">Comparer</span>
                <span class="chip" style="padding:6px 10px;font-size:11px">Détecter arnaque</span>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:14px;color:var(--accent)">
                <span style="font-family:var(--font-mono);font-size:11px;letter-spacing:.16em">OUVRIR L'ASSISTANT</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- 🆕 SECTION ADAPTÉ À TON ENTRAÎNEMENT (lien Coaching → Marketplace) -->
      <section class="row-section" *ngIf="trainingContext" style="padding-top:calc(var(--row-y) * 0.6)">
        <div [cpReveal]="0" style="margin-bottom:24px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <span style="width:36px;height:1px;background:var(--accent)"></span>
            <span class="eyebrow" style="color:var(--accent)">Lien Coaching ↔ Marketplace</span>
          </div>
          <h2 class="display" style="font-size:42px;margin:0">Adapté à ton entraînement</h2>
          <p style="color:var(--muted);max-width:620px;margin:10px 0 0;font-size:14px">
            {{ trainingContext }}
          </p>
        </div>

        <div *ngIf="adaptedItems.length === 0" class="cp-empty" style="padding:32px">
          <i class="bi bi-search"></i>
          <p>Aucun équipement ne matche encore ton profil. Essaie d'ajouter un sport dans ton coach profile.</p>
        </div>

        <div *ngIf="adaptedItems.length > 0" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:var(--gap)">
          <div *ngFor="let p of adaptedItems; let i = index" [cpReveal]="i*30" (click)="open(p)" style="cursor:pointer">
            <div class="card-cp tilt prod">
              <div class="prod-img">
                <img *ngIf="p.images?.length" [src]="p.images?.[0]" [alt]="p.name" loading="lazy">
                <div *ngIf="!p.images?.length" style="height:100%;display:grid;place-items:center;color:var(--line-strong)">
                  <i class="bi bi-image" style="font-size:2.5rem"></i>
                </div>
                <span class="match-badge"><i class="bi bi-bullseye"></i> Match</span>
              </div>
              <div class="prod-meta">
                <div class="row1">
                  <span class="tag">{{ p.sport }}</span>
                  <span *ngIf="p.rating" style="font-size:11px;color:var(--muted);display:inline-flex;align-items:center;gap:4px">
                    <i class="bi bi-star-fill" style="color:var(--warning)"></i>
                    {{ p.rating | number:'1.1-1' }}
                  </span>
                </div>
                <h4>{{ p.name }}</h4>
                <div class="price">{{ p.price }} €</div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="injuriesActiveCount > 0" class="cross-alert">
          <i class="bi bi-bandaid-fill"></i>
          <div>
            <strong>⚠️ {{ injuriesActiveCount }} blessure(s) active(s) détectée(s)</strong>
            <p>On te recommande de consulter un kiné ou physio avant de reprendre l'entraînement.</p>
          </div>
          <a class="btn-cp btn-primary-cp" routerLink="/marketplace" fragment="services">
            Voir les prestations PHYSIO
            <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      </section>

      <!-- CATALOGUE -->
      <section class="row-section" style="padding-top:calc(var(--row-y) * 0.85)">
        <div [cpReveal]="0" style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:24px;gap:24px;flex-wrap:wrap">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
              <span style="width:36px;height:1px;background:var(--ink)"></span>
              <span class="eyebrow">Tout le catalogue</span>
            </div>
            <h2 class="display" style="font-size:48px;margin:0">{{ items.length }} résultats</h2>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:12px;color:var(--muted);font-family:var(--font-mono);letter-spacing:.14em">VUE</span>
            <div style="display:flex;background:white;border:1px solid var(--line-strong);border-radius:12px;padding:4px">
              <button (click)="layout='bento'" class="btn-cp btn-sm-cp"
                      [style.background]="layout==='bento' ? 'var(--ink)' : 'transparent'"
                      [style.color]="layout==='bento' ? 'white' : 'var(--ink)'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="18" rx="1.5"/><rect x="13" y="3" width="8" height="11" rx="1.5"/></svg>
                Bento
              </button>
              <button (click)="layout='grid'" class="btn-cp btn-sm-cp"
                      [style.background]="layout==='grid' ? 'var(--ink)' : 'transparent'"
                      [style.color]="layout==='grid' ? 'white' : 'var(--ink)'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                Grille
              </button>
              <button (click)="layout='list'" class="btn-cp btn-sm-cp"
                      [style.background]="layout==='list' ? 'var(--ink)' : 'transparent'"
                      [style.color]="layout==='list' ? 'white' : 'var(--ink)'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                Liste
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="items.length === 0" class="cp-empty">
          <i class="bi bi-bag-x"></i>
          <h4>Aucune annonce</h4>
          <p>Soyez le premier à publier sur le marketplace.</p>
          <button class="btn-cp btn-primary-cp" routerLink="/marketplace/equipment/new">Créer une annonce</button>
        </div>

        <div *ngIf="layout === 'bento' && items.length > 0" class="bento" style="grid-auto-rows:minmax(280px, auto)">
          <div *ngFor="let p of items; let i = index" [class]="bentoSpan(i)" [cpReveal]="i*40" (click)="open(p)">
            <ng-container *ngTemplateOutlet="prodCard; context: {p: p}"></ng-container>
          </div>
        </div>

        <div *ngIf="layout === 'grid' && items.length > 0" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:var(--gap)">
          <div *ngFor="let p of items; let i = index" [cpReveal]="i*30" (click)="open(p)">
            <ng-container *ngTemplateOutlet="prodCard; context: {p: p}"></ng-container>
          </div>
        </div>

        <div *ngIf="layout === 'list' && items.length > 0" style="display:grid;gap:var(--gap)">
          <div *ngFor="let p of items; let i = index" [cpReveal]="i*25" (click)="open(p)">
            <div class="card-cp tilt prod" style="display:grid;grid-template-columns:180px 1fr auto;gap:18px;padding:14px;align-items:center">
              <div class="prod-img" style="border-radius:14px;aspect-ratio:4/3">
                <img *ngIf="p.images?.length" [src]="p.images?.[0]" [alt]="p.name" loading="lazy">
              </div>
              <div>
                <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;flex-wrap:wrap">
                  <span style="font-family:var(--font-mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;background:rgba(0,230,118,.14);color:var(--accent-deep);padding:3px 8px;border-radius:999px">{{ p.sport }}</span>
                  <span style="font-size:12px;color:var(--muted)">{{ labelCondition(p.condition) }}</span>
                  <span style="font-size:12px;color:var(--muted);display:inline-flex;align-items:center;gap:4px">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    {{ p.city }}
                  </span>
                </div>
                <h4 style="margin:2px 0;font-size:16px;font-weight:600;color:var(--ink)">{{ p.name }}</h4>
                <div style="font-size:12px;color:var(--muted);margin-top:6px">{{ truncate(p.description) }}</div>
              </div>
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px">
                <div style="font-family:var(--font-display);font-size:30px">{{ p.price }} €</div>
                <ng-container *ngIf="!isOwner(p)">
                  <button class="btn-cp btn-dark-cp" style="padding:10px 14px" (click)="addToCart(p);$event.stopPropagation()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h2l3 12h12l2-9H6"/></svg>
                    Ajouter
                  </button>
                </ng-container>
                <ng-container *ngIf="isOwner(p)">
                  <span style="font-size:11px;color:var(--muted);font-family:var(--font-mono)">Mon annonce</span>
                  <button class="btn-cp btn-ghost-cp" style="padding:8px 12px;font-size:12px" (click)="editListing(p);$event.stopPropagation()">Modifier</button>
                </ng-container>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="cp-footer">
        <span>CoPlay · Marketplace + Coaching · 2026</span>
        <span>Powered by Groq · Llama 3.1</span>
      </footer>
    </div>

    <ng-template #prodCard let-p="p">
      <div class="card-cp tilt prod">
        <div class="prod-img">
          <img *ngIf="p.images?.length" [src]="p.images?.[0]" [alt]="p.name" loading="lazy">
          <div *ngIf="!p.images?.length" style="height:100%;display:grid;place-items:center;color:var(--line-strong)">
            <i class="bi bi-image" style="font-size:2.5rem"></i>
          </div>
          <button *ngIf="!isOwner(p)" class="quick-add" title="Ajouter au panier" (click)="addToCart(p);$event.stopPropagation()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
          <button *ngIf="isOwner(p)" class="quick-add" title="Modifier" style="background:var(--secondary,#F47920)" (click)="editListing(p);$event.stopPropagation()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
        <div class="prod-meta">
          <div class="loc">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>
            {{ p.city || '—' }} · {{ labelCondition(p.condition) }}
          </div>
          <div class="row1">
            <span class="tag">{{ p.sport }}</span>
            <span *ngIf="p.rating" style="font-size:11px;color:var(--muted);display:inline-flex;align-items:center;gap:4px">
              <i class="bi bi-star-fill" style="color:var(--warning)"></i>
              {{ p.rating | number:'1.1-1' }}
            </span>
          </div>
          <h4>{{ p.name }}</h4>
          <div class="price">{{ p.price }} €</div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    /* Badge "match" sur les produits adaptés à l'entraînement */
    .match-badge {
      position: absolute;
      top: 10px; left: 10px;
      background: var(--accent);
      color: var(--navy);
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0,0,0,.15);
    }
    /* Alerte cross-module (blessures → marketplace) */
    .cross-alert {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 22px;
      margin-top: 24px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(239,68,68,.15), rgba(239,68,68,.05));
      border: 1px solid rgba(239,68,68,.4);
    }
    .cross-alert > i {
      font-size: 28px;
      color: #ef4444;
    }
    .cross-alert strong {
      display: block;
      margin-bottom: 4px;
      color: var(--ink);
    }
    .cross-alert p {
      margin: 0;
      font-size: 13px;
      color: var(--muted);
    }
    .cross-alert > div { flex: 1; }
  `],
})
export class MarketplaceHomeComponent implements OnInit {
  items: Equipment[] = [];
  recommended: Equipment[] = [];
  q = '';
  sport = '';
  condition = '';
  layout: 'bento' | 'grid' | 'list' = 'bento';
  fallbackImg = 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=900';

  // 🆕 Lien cross-module Coaching → Marketplace
  adaptedItems: Equipment[] = [];
  trainingContext = '';
  injuriesActiveCount = 0;

  matchMetrics = [
    { label: 'MATCH NIVEAU', value: 96 },
    { label: 'PRIX MARCHÉ', value: 87 },
    { label: 'RÉPUTATION', value: 99 },
  ];

  constructor(
    private mp: MarketplaceService,
    private cs: CoachingService,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.load();
    this.mp.recommendations(8).subscribe({ next: r => this.recommended = r || [], error: () => {} });
    this.loadTrainingContext();
  }

  /** Récupère sport + blessures depuis le module Coaching pour filtrer le marketplace. */
  loadTrainingContext() {
    forkJoin({
      profile: this.cs.myCoachProfile().pipe(catchError(() => of(null as any))),
      injuries: this.cs.myInjuries().pipe(catchError(() => of([] as any[]))),
      programs: this.cs.programsAsClient().pipe(catchError(() => of([] as any[]))),
    }).subscribe(({ profile, injuries, programs }) => {
      this.injuriesActiveCount = (injuries || []).filter(
        (i: any) => i.status === 'ACTIVE' || i.status === 'OPEN' || !i.healed
      ).length;

      // Détermine le sport pertinent : profile coach > 1er programme > rien
      const sport: string | undefined =
        profile?.sport ||
        (programs?.[0] as any)?.sport ||
        undefined;

      if (sport) {
        this.trainingContext = `Sélection basée sur ton sport (${sport})` +
          (programs.length ? ` et tes ${programs.length} programme(s)` : '') +
          (this.injuriesActiveCount > 0 ? ` — ${this.injuriesActiveCount} blessure(s) active(s)` : '');

        this.mp.searchEquipments({ sport, condition: '', q: '' }).subscribe({
          next: r => this.adaptedItems = (r || []).slice(0, 8),
          error: () => this.adaptedItems = [],
        });
      } else if (this.injuriesActiveCount > 0) {
        this.trainingContext = `Tu as ${this.injuriesActiveCount} blessure(s) active(s). On te suggère des prestations de récupération.`;
        this.adaptedItems = [];
      } else {
        this.trainingContext = '';
      }
    });
  }

  load() { this.mp.listEquipment(0, 24).subscribe(p => this.items = p?.content || []); }

  search() {
    this.mp.searchEquipments({ q: this.q, sport: this.sport, condition: this.condition }).subscribe(r => this.items = r || []);
  }

  open(e: Equipment) { this.router.navigate(['/marketplace/equipment', e.equipmentId]); }

  isOwner(e: Equipment): boolean {
    const uid = this.auth.getUserId();
    return !!uid && !!e.sellerId && e.sellerId === uid;
  }

  addToCart(e: Equipment) {
    if (!e.equipmentId) return;
    if (this.isOwner(e)) return;  // cannot buy own listing
    this.mp.addToCart(e.equipmentId, 'EQUIPMENT', 1).subscribe(() => this.router.navigate(['/marketplace/cart']));
  }

  editListing(e: Equipment) {
    this.router.navigate(['/marketplace/equipment', e.equipmentId, 'edit']);
  }

  deleteListing(e: Equipment) {
    if (!confirm(`Supprimer l'annonce "${e.name}" ?`)) return;
    this.mp.deleteEquipment(e.equipmentId!).subscribe({
      next: () => { this.items = this.items.filter(i => i.equipmentId !== e.equipmentId); },
      error: () => alert('Erreur lors de la suppression.')
    });
  }

  labelCondition(c?: string) { return c === 'NEW' ? 'Neuf' : c === 'USED' ? 'Occasion' : c === 'REFURBISHED' ? 'Reconditionné' : (c || ''); }

  bentoSpan(i: number): string {
    return i === 0 ? 'b-2' : i === 3 ? 'b-2' : 'b-1';
  }

  bgImage(p: Equipment): string {
    const url = p.images?.[0] || this.fallbackImg;
    return `url(${url}) center/cover`;
  }

  truncate(s?: string): string {
    if (!s) return '';
    return s.length > 80 ? s.slice(0, 80) + '…' : s;
  }
}
