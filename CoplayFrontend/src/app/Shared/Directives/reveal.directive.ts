import { Directive, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[cpReveal]',
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  @Input() cpReveal = 0; // delay in ms

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    const node = this.el.nativeElement;
    node.classList.add('reveal');
    if (this.cpReveal) node.style.transitionDelay = `${this.cpReveal}ms`;

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('in');
        this.observer?.disconnect();
      }
    }, { threshold: 0.15 });
    this.observer.observe(node);
  }

  ngOnDestroy() { this.observer?.disconnect(); }
}
