import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';

export interface Crumb { label: string; link?: string; }

@Component({
  selector: 'cp-page-header',
  template: `
    <div class="crumb-row">
      <button *ngIf="showBack" type="button" class="crumb-back" (click)="back()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
        {{ backLabel }}
      </button>

      <div class="crumb" *ngIf="crumbs?.length">
        <ng-container *ngFor="let c of crumbs; let last = last; let first = first">
          <span *ngIf="!first">›</span>
          <a *ngIf="c.link && !last" [routerLink]="c.link">{{ c.label }}</a>
          <span *ngIf="!c.link || last">{{ c.label }}</span>
        </ng-container>
      </div>

      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
        <div>
          <div class="eyebrow" *ngIf="eyebrow" style="margin-bottom:10px">{{ eyebrow }}</div>
          <h1 class="display" style="font-size:clamp(40px, 5vw, 72px);margin:0">{{ title }}</h1>
          <p *ngIf="subtitle" style="color:var(--muted);max-width:600px;margin:10px 0 0;font-size:15px">{{ subtitle }}</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() eyebrow?: string;
  @Input() crumbs: Crumb[] = [];
  @Input() showBack = false;
  @Input() backLabel = 'Retour';

  constructor(private location: Location) {}
  back() { this.location.back(); }
}
