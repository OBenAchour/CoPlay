import { Component, ElementRef, Input, OnDestroy, AfterViewInit } from '@angular/core';

@Component({
  selector: 'cp-counter',
  template: `<span>{{ value }}{{ suffix }}</span>`,
})
export class CounterComponent implements AfterViewInit, OnDestroy {
  @Input() to = 0;
  @Input() duration = 1200;
  @Input() suffix = '';

  value = 0;
  private observer?: IntersectionObserver;
  private rafId?: number;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    const node = this.el.nativeElement;
    let started = false;
    this.observer = new IntersectionObserver(([entry]) => {
      if (!started && entry.isIntersecting) {
        started = true;
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / this.duration);
          const eased = 1 - Math.pow(1 - p, 3);
          this.value = Math.round(eased * this.to);
          if (p < 1) this.rafId = requestAnimationFrame(tick);
        };
        this.rafId = requestAnimationFrame(tick);
        this.observer?.disconnect();
      }
    }, { threshold: 0.4 });
    this.observer.observe(node);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
