import { Component, Input } from '@angular/core';

@Component({
  selector: 'cp-acwr-gauge',
  template: `
    <div style="position:relative;width:200px;height:120px">
      <svg viewBox="0 0 200 120" width="200" height="120">
        <path d="M 20 100 A 80 80 0 0 1 180 100"
              stroke="rgba(255,255,255,0.08)" stroke-width="14" fill="none" stroke-linecap="round"/>
        <path d="M 20 100 A 80 80 0 0 1 180 100"
              [attr.stroke]="bandColor" stroke-width="14" fill="none" stroke-linecap="round"
              [attr.stroke-dasharray]="dasharray"
              style="transition:stroke-dasharray 1.6s var(--easing)"/>
        <circle [attr.cx]="cx" [attr.cy]="cy" r="8"
                fill="white" [attr.stroke]="bandColor" stroke-width="3"/>
      </svg>
      <div style="position:absolute;left:0;right:0;bottom:0;text-align:center">
        <div class="display" style="font-size:46px;color:white;line-height:1">{{ display }}</div>
        <div class="mono" style="font-size:10px;letter-spacing:.16em;color:var(--muted-2)">RATIO ACWR</div>
      </div>
    </div>
  `,
})
export class AcwrGaugeComponent {
  @Input() value = 0;

  get angle(): number { return Math.min(180, Math.max(0, this.value * 100)); }
  get bandColor(): string { return this.value >= 0.8 && this.value <= 1.3 ? 'var(--accent)' : 'var(--danger)'; }
  get dasharray(): string { return `${this.angle * 2.5} 999`; }
  get cx(): number { const a = (this.angle - 90) * Math.PI / 180; return 100 + 80 * Math.cos(a); }
  get cy(): number { const a = (this.angle - 90) * Math.PI / 180; return 100 + 80 * Math.sin(a); }
  get display(): string { return this.value > 0 ? this.value.toFixed(2) : '—'; }
}
