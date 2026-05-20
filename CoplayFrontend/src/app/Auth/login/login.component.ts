import {
  Component, OnInit, OnDestroy, AfterViewInit,
  NgZone, ViewChildren, QueryList, ElementRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../Core/Services/Auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

  loginForm!: FormGroup;
  passwordVisible = false;
  errorMessage = '';
  isLoading = false;
  showForgotModal = false;
  forgotEmail = '';

  // Orbit state
  hoveredCard = -1;
  private rafId?: number;
  private time = 0;
  private speed = 0.012;

  orbitCards = [
    { label: 'Basket', color: '#F58220', bg: 'rgba(245,130,32,.25)', startAngle: 0 },
    { label: 'Padel',  color: '#1FA9E0', bg: 'rgba(31,169,224,.25)', startAngle: 2.094 },
    { label: 'Foot',   color: '#22C55E', bg: 'rgba(34,197,94,.25)',  startAngle: 4.189 },
  ];

  @ViewChildren('cardRef') cardRefs!: QueryList<ElementRef<HTMLElement>>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this.loop());
  }

  private loop(): void {
    this.time += this.speed;
    const rx = 138, ry = 44;

    this.cardRefs.forEach((ref, i) => {
      const angle = this.orbitCards[i].startAngle + this.time;
      const x = Math.cos(angle) * rx;
      const y = Math.sin(angle) * ry;
      const depth = Math.sin(angle);

      const isHovered = this.hoveredCard === i;
      const baseScale = 0.8 + 0.2 * (depth + 1) / 2;
      const scale = isHovered ? 1.13 : baseScale;
      const zIndex = depth > 0 ? 5 : 1;
      const opacity = 0.55 + 0.45 * (depth + 1) / 2;

      const el = ref.nativeElement;
      el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
      el.style.zIndex = String(zIndex);
      el.style.opacity = String(isHovered ? 1 : opacity);
      el.style.filter = depth < -0.4 ? `blur(${Math.abs(depth + 0.4) * 1.2}px)` : 'none';
    });

    this.rafId = requestAnimationFrame(() => this.loop());
  }

  onCardHover(i: number): void {
    this.hoveredCard = i;
    this.speed = 0.003;
  }

  onCardLeave(): void {
    this.hoveredCard = -1;
    this.speed = 0.012;
  }

  togglePasswordVisibility(): void { this.passwordVisible = !this.passwordVisible; }

  onLogin(): void {
    if (!this.loginForm.valid) return;
    this.errorMessage = '';
    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => { this.isLoading = false; this.router.navigate(['/dashboard']); },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message ?? err.error ?? 'Email ou mot de passe incorrect.';
      }
    });
  }

  openForgotPasswordModal(): void { this.forgotEmail = ''; this.showForgotModal = true; this.errorMessage = ''; }
  closeForgotPasswordModal(): void { this.showForgotModal = false; this.forgotEmail = ''; }

  sendForgotPassword(): void {
    if (!this.forgotEmail) return;
    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: (res) => { alert('Succès : ' + (res.message || 'Email envoyé.')); this.closeForgotPasswordModal(); },
      error: (err) => { alert('Erreur : ' + (err.error?.error || err.error?.message || 'Email introuvable')); }
    });
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
