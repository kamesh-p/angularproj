import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnInit {
  @Input() appHighlight = '#ffeb3b';
  @Input() defaultColor = 'transparent';
  
  constructor(private el: ElementRef) {
    console.log('🎨 [CONSTRUCTOR] Directive created!');
    console.log('📍 Element:', this.el.nativeElement);
  }
  
  ngOnInit() {
    console.log('✅ [INIT] Directive initialized');
    console.log('🎨 Colors:', { highlight: this.appHighlight, default: this.defaultColor });
    this.highlight(this.defaultColor);
  }
  
  @HostListener('mouseenter') onMouseEnter() {
    console.log('🖱️ [EVENT] Mouse entered - Highlighting');
    this.highlight(this.appHighlight);
  }
  
  @HostListener('mouseleave') onMouseLeave() {
    console.log('🖱️ [EVENT] Mouse left - Removing highlight');
    this.highlight(this.defaultColor);
  }
  
  @HostListener('click') onClick() {
    console.log('👆 [EVENT] Clicked!');
  }
  
  // Make this public and provide overloads for different use cases
  highlight(color?: string) {
    const highlightColor = color || this.appHighlight;
    console.log(`🎨 [ACTION] Changing to: ${highlightColor}`);
    this.el.nativeElement.style.backgroundColor = highlightColor;
  }
  
  // Additional public methods for better control
  reset() {
    this.highlight(this.defaultColor);
  }
  
  pulse() {
    this.highlight(this.appHighlight);
    setTimeout(() => this.reset(), 1000);
  }
}