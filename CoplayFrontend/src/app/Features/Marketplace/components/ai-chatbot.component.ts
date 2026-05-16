import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { MarketplaceService } from '../services/marketplace.service';

interface Msg { role: 'user' | 'bot'; text: string; time: string; }
interface Topic { icon: string; label: string; prompt: string; }

@Component({
  selector: 'app-marketplace-chatbot',
  styles: [`
    :host { display: block; }

    .ai-shell {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 0;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: 0 20px 60px -15px rgba(0,0,0,.12);
      min-height: calc(100vh - 220px);
    }
    @media (max-width: 960px) { .ai-shell { grid-template-columns: 1fr; min-height: auto; } .ai-side { display: none; } }

    .ai-side {
      background: linear-gradient(180deg, #0F1419 0%, #1A1F2E 100%);
      color: #fff;
      padding: 1.75rem 1.5rem;
      border-right: 1px solid rgba(255,255,255,.06);
      position: relative;
      overflow: hidden;
    }
    .ai-side::before {
      content: '';
      position: absolute;
      top: -20%;
      left: -30%;
      width: 200%;
      height: 60%;
      background: radial-gradient(circle, var(--accent) 0%, transparent 60%);
      opacity: .08;
      filter: blur(40px);
      pointer-events: none;
    }
    .ai-side > * { position: relative; z-index: 1; }
    .ai-brand {
      display: flex; align-items: center; gap: .6rem; margin-bottom: 1.5rem;
    }
    .ai-orb {
      width: 38px; height: 38px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, var(--accent), #00c853);
      box-shadow: 0 0 24px rgba(0,230,118,.5);
      animation: orbPulse 3s ease-in-out infinite;
      position: relative;
    }
    .ai-orb::after {
      content: ''; position: absolute; inset: -4px;
      border: 1px solid rgba(0,230,118,.3);
      border-radius: 50%;
      animation: orbRing 3s ease-in-out infinite;
    }
    @keyframes orbPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    @keyframes orbRing { 0%, 100% { transform: scale(1); opacity: .5; } 50% { transform: scale(1.3); opacity: 0; } }

    .ai-brand-text { font-family: 'Anton', sans-serif; font-size: 1.4rem; line-height: 1; text-transform: uppercase; }
    .ai-brand-sub { font-family: 'JetBrains Mono', monospace; font-size: .65rem; letter-spacing: .14em; color: var(--accent); text-transform: uppercase; }

    .ai-stat-row { display: flex; gap: .75rem; margin-bottom: 2rem; }
    .ai-stat-mini {
      flex: 1;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: var(--radius);
      padding: .75rem;
    }
    .ai-stat-mini-val { font-family: 'Anton', sans-serif; font-size: 1.4rem; line-height: 1; }
    .ai-stat-mini-lbl { font-family: 'JetBrains Mono', monospace; font-size: .6rem; letter-spacing: .08em; opacity: .55; text-transform: uppercase; margin-top: .25rem; }

    .ai-section-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: .68rem; letter-spacing: .14em; text-transform: uppercase;
      color: rgba(255,255,255,.55);
      margin-bottom: .75rem;
    }

    .ai-topic {
      display: flex; align-items: center; gap: .65rem;
      width: 100%;
      padding: .7rem .85rem;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.06);
      border-radius: var(--radius);
      color: #fff;
      cursor: pointer;
      transition: all .25s ease;
      text-align: left;
      font-size: .85rem;
      margin-bottom: .4rem;
    }
    .ai-topic:hover {
      background: var(--accent);
      color: var(--ink);
      border-color: var(--accent);
      transform: translateX(2px);
    }
    .ai-topic i { font-size: 1rem; }

    .ai-side-foot {
      position: absolute; bottom: 1.5rem; left: 1.5rem; right: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255,255,255,.08);
      font-size: .72rem;
      color: rgba(255,255,255,.5);
      line-height: 1.5;
    }

    .ai-main {
      display: grid;
      grid-template-rows: auto 1fr auto;
      background:
        radial-gradient(circle at 5% 0%, rgba(0,230,118,.06) 0%, transparent 35%),
        radial-gradient(circle at 95% 100%, rgba(255,87,34,.04) 0%, transparent 40%),
        var(--paper);
      min-height: 0;
    }

    .ai-head {
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255,255,255,.6);
      backdrop-filter: blur(10px);
    }
    .ai-status {
      display: inline-flex; align-items: center; gap: .4rem;
      font-size: .78rem;
      color: var(--success);
      font-weight: 600;
    }
    .ai-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 0 0 rgba(22, 163, 74, .5);
      animation: livePulse 2s infinite;
    }
    @keyframes livePulse { 0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, .6); } 70% { box-shadow: 0 0 0 8px rgba(22, 163, 74, 0); } }

    .ai-stream {
      padding: 2rem 2.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .ai-welcome {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center;
      padding: 2rem 1rem;
      flex: 1;
    }
    .ai-welcome-orb {
      width: 96px; height: 96px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, var(--accent), #00c853 60%, var(--ink));
      box-shadow: 0 20px 60px -10px rgba(0,230,118,.5);
      margin-bottom: 1.5rem;
      position: relative;
      animation: floatBob 4s ease-in-out infinite;
    }
    @keyframes floatBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    .ai-welcome h2 {
      font-family: 'Anton', sans-serif;
      font-size: clamp(2rem, 4vw, 3rem);
      line-height: 1;
      text-transform: uppercase;
      margin: 0 0 .5rem;
    }
    .ai-welcome h2 .accent { color: #00c853; }
    .ai-welcome p { color: var(--muted); max-width: 480px; margin-bottom: 2rem; }

    .ai-msg-row {
      display: flex;
      gap: .75rem;
      max-width: 78%;
    }
    .ai-msg-user { align-self: flex-end; flex-direction: row-reverse; }
    .ai-msg-bot { align-self: flex-start; }

    .ai-avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
      display: grid; place-items: center;
      font-family: 'Anton', sans-serif;
      font-size: .9rem;
      letter-spacing: .02em;
    }
    .ai-msg-user .ai-avatar { background: var(--ink); color: var(--paper); }
    .ai-msg-bot .ai-avatar {
      background: radial-gradient(circle at 30% 30%, var(--accent), #00c853);
      color: var(--ink);
    }

    .ai-bubble {
      padding: .85rem 1.1rem;
      border-radius: 18px;
      font-size: .94rem;
      line-height: 1.55;
      box-shadow: 0 1px 2px rgba(0,0,0,.04);
    }
    .ai-msg-user .ai-bubble {
      background: var(--ink);
      color: var(--paper);
      border-bottom-right-radius: 4px;
    }
    .ai-msg-bot .ai-bubble {
      background: var(--paper);
      color: #1a1a1a;
      border: 1px solid var(--line);
      border-bottom-left-radius: 4px;
    }

    .ai-time {
      font-family: 'JetBrains Mono', monospace;
      font-size: .65rem;
      color: var(--muted);
      letter-spacing: .06em;
      margin-top: .25rem;
      text-transform: uppercase;
    }
    .ai-msg-user .ai-time { text-align: right; }

    .ai-typing { display: inline-flex; gap: 4px; padding: 4px 0; }
    .ai-typing span {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--accent);
      animation: typingBounce 1.2s infinite ease-in-out;
    }
    .ai-typing span:nth-child(2) { animation-delay: .15s; }
    .ai-typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes typingBounce { 0%, 80%, 100% { transform: scale(.6); opacity: .4; } 40% { transform: scale(1); opacity: 1; } }

    .ai-foot {
      padding: 1.25rem 2rem 1.5rem;
      border-top: 1px solid var(--line);
      background: rgba(255,255,255,.7);
      backdrop-filter: blur(10px);
    }

    .ai-quickreplies { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: .85rem; }
    .ai-chip {
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 99px;
      padding: .4rem .85rem;
      font-size: .8rem;
      color: #1a1a1a;
      cursor: pointer;
      transition: all .2s ease;
    }
    .ai-chip:hover { background: var(--ink); color: var(--paper); border-color: var(--ink); transform: translateY(-1px); }

    .ai-input-wrap {
      display: flex;
      gap: .5rem;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: .35rem .35rem .35rem 1.1rem;
      transition: border-color .2s ease, box-shadow .2s ease;
    }
    .ai-input-wrap:focus-within {
      border-color: var(--ink);
      box-shadow: 0 0 0 4px rgba(0,230,118,.12);
    }
    .ai-input-wrap input {
      flex: 1;
      border: none; outline: none;
      font-size: .95rem;
      font-family: inherit;
      color: var(--ink);
      background: transparent;
    }
    .ai-send {
      display: grid; place-items: center;
      width: 42px; height: 42px;
      border-radius: 10px;
      background: var(--ink);
      color: var(--paper);
      border: none;
      cursor: pointer;
      transition: all .2s ease;
    }
    .ai-send:hover:not(:disabled) {
      background: var(--accent);
      color: var(--ink);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px -4px rgba(0,230,118,.5);
    }
    .ai-send:disabled { opacity: .35; cursor: not-allowed; }

    .ai-disclaimer {
      font-size: .7rem;
      color: var(--muted);
      text-align: center;
      margin-top: .65rem;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: .04em;
    }
  `],
  template: `
    <div class="page route-enter">
      <div class="crumb-row">
        <button class="crumb-back" routerLink="/marketplace">
          <i class="bi bi-arrow-left"></i> Retour
        </button>
        <div class="crumb">
          <a routerLink="/marketplace">Marketplace</a>
          <span>›</span>
          <span>Assistant IA</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
          <div>
            <div class="eyebrow" style="margin-bottom:10px">Intelligence Artificielle</div>
            <h1 class="display" style="font-size:clamp(40px, 5vw, 72px);margin:0">Assistant Marketplace</h1>
            <p style="color:var(--muted);max-width:560px;margin:10px 0 0;font-size:15px">
              Trouvez le bon équipement, comparez, négociez. Powered by Groq · Llama 3.1.
            </p>
          </div>
        </div>
      </div>

      <div class="full" style="padding-top:24px">
        <div class="ai-shell" [cpReveal]="0">

          <!-- Sidebar -->
          <aside class="ai-side">
            <div class="ai-brand">
              <div class="ai-orb"></div>
              <div>
                <div class="ai-brand-text">CoPlay AI</div>
                <div class="ai-brand-sub">Llama 3.1 · Live</div>
              </div>
            </div>

            <div class="ai-stat-row">
              <div class="ai-stat-mini">
                <div class="ai-stat-mini-val">∞</div>
                <div class="ai-stat-mini-lbl">Requêtes</div>
              </div>
              <div class="ai-stat-mini">
                <div class="ai-stat-mini-val">{{ messages.length }}</div>
                <div class="ai-stat-mini-lbl">Messages</div>
              </div>
              <div class="ai-stat-mini">
                <div class="ai-stat-mini-val">‹2s</div>
                <div class="ai-stat-mini-lbl">Latence</div>
              </div>
            </div>

            <div class="ai-section-label">Suggestions</div>
            <button *ngFor="let t of topics" class="ai-topic" (click)="quickAsk(t.prompt)">
              <i class="bi" [class]="'bi-' + t.icon"></i>
              <span>{{ t.label }}</span>
            </button>

            <div class="ai-side-foot">
              L'IA peut commettre des erreurs. Vérifiez les informations critiques avant achat.
            </div>
          </aside>

          <!-- Main chat -->
          <section class="ai-main">
            <header class="ai-head">
              <div>
                <div style="font-family:'Anton',sans-serif;font-size:1.2rem;text-transform:uppercase;line-height:1">Conversation</div>
                <div style="font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:.25rem">
                  {{ messages.length === 0 ? 'Démarrez une discussion' : messages.length + ' messages' }}
                </div>
              </div>
              <div class="d-flex gap-2 align-items-center">
                <span class="ai-status"><span class="ai-dot"></span> En ligne</span>
                <button class="btn-cp btn-ghost-cp btn-sm-cp" (click)="reset()" *ngIf="messages.length > 0">
                  <i class="bi bi-arrow-clockwise"></i> Nouvelle conv.
                </button>
              </div>
            </header>

            <div #stream class="ai-stream">
              <div *ngIf="messages.length === 0" class="ai-welcome">
                <div class="ai-welcome-orb"></div>
                <h2>Comment je peux<br><span class="accent">vous aider</span> ?</h2>
                <p>Demandez-moi des recommandations, des comparatifs, des estimations de prix, ou des conseils d'achat sportif.</p>
              </div>

              <div *ngFor="let m of messages" class="ai-msg-row" [ngClass]="m.role === 'user' ? 'ai-msg-user' : 'ai-msg-bot'">
                <div class="ai-avatar">{{ m.role === 'user' ? 'V' : 'AI' }}</div>
                <div>
                  <div class="ai-bubble">{{ m.text }}</div>
                  <div class="ai-time">{{ m.time }}</div>
                </div>
              </div>

              <div *ngIf="loading" class="ai-msg-row ai-msg-bot">
                <div class="ai-avatar">AI</div>
                <div>
                  <div class="ai-bubble">
                    <div class="ai-typing"><span></span><span></span><span></span></div>
                  </div>
                </div>
              </div>
            </div>

            <footer class="ai-foot">
              <div class="ai-quickreplies" *ngIf="messages.length === 0">
                <button class="ai-chip" (click)="quickAsk('Quel ballon de foot pour débutant ?')">⚽ Ballon débutant</button>
                <button class="ai-chip" (click)="quickAsk('Comment estimer le prix d\\'une raquette d\\'occasion ?')">💰 Estimer un prix</button>
                <button class="ai-chip" (click)="quickAsk('Conseils pour acheter du matériel de running')">🏃 Running gear</button>
                <button class="ai-chip" (click)="quickAsk('Vélo route ou vélo gravel pour un débutant ?')">🚴 Comparer vélos</button>
              </div>

              <form class="ai-input-wrap" (ngSubmit)="send()">
                <input [(ngModel)]="input" name="prompt" autocomplete="off"
                       placeholder="Posez votre question à l'IA..." [disabled]="loading">
                <button type="submit" class="ai-send" [disabled]="loading || !input.trim()">
                  <i class="bi bi-arrow-up"></i>
                </button>
              </form>
              <div class="ai-disclaimer">↵ pour envoyer · Powered by Groq</div>
            </footer>
          </section>
        </div>
      </div>
    </div>
  `,
})
export class MarketplaceChatbotComponent implements AfterViewChecked {
  @ViewChild('stream') stream?: ElementRef<HTMLDivElement>;
  messages: Msg[] = [];
  input = '';
  loading = false;
  private shouldScroll = false;

  topics: Topic[] = [
    { icon: 'bag-heart', label: 'Recommander un produit', prompt: 'Recommande-moi un équipement sportif adapté à mon profil et budget' },
    { icon: 'cash-coin', label: 'Estimer un prix', prompt: 'Comment estimer le prix d\'une raquette de tennis d\'occasion ?' },
    { icon: 'arrow-left-right', label: 'Comparer 2 produits', prompt: 'Compare le ballon Adidas Euro 2024 et le Nike Strike pour un usage amateur' },
    { icon: 'people', label: 'Trouver un prestataire', prompt: 'J\'organise un tournoi amateur, quel prestataires me conseilles-tu ?' },
    { icon: 'shield-check', label: 'Détecter une arnaque', prompt: 'Comment repérer une annonce frauduleuse sur un marketplace sportif ?' },
    { icon: 'lightning', label: 'Conseil rapide', prompt: 'Donne-moi 3 conseils pour bien acheter du matériel sportif d\'occasion' },
  ];

  constructor(private mp: MarketplaceService) {}

  quickAsk(q: string) { this.input = q; this.send(); }

  send() {
    const text = this.input.trim();
    if (!text) return;
    this.messages.push({ role: 'user', text, time: this.now() });
    this.input = '';
    this.loading = true;
    this.shouldScroll = true;
    this.mp.chat(text).subscribe({
      next: r => { this.messages.push({ role: 'bot', text: r.reply || '...', time: this.now() }); this.loading = false; this.shouldScroll = true; },
      error: () => { this.messages.push({ role: 'bot', text: 'Désolé, l\'IA est temporairement indisponible. Réessayez dans quelques instants.', time: this.now() }); this.loading = false; this.shouldScroll = true; },
    });
  }

  reset() { this.messages = []; }

  ngAfterViewChecked() {
    if (this.shouldScroll && this.stream) {
      this.stream.nativeElement.scrollTop = this.stream.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }

  now() { return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
}
