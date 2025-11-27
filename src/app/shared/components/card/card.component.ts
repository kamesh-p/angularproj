import { 
  Component, 
  ContentChild, 
  ContentChildren, 
  QueryList, 
  TemplateRef,
  AfterContentInit,
  AfterContentChecked, 
  Input,
  Directive
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Custom directive to identify card sections
@Directive({
  selector: '[cardAction]',
  standalone: true
})
export class CardActionDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: "./card.component.html",
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements AfterContentInit, AfterContentChecked {
  @Input() elevated = false;
  
  // Query for custom template
  @ContentChild('customContent') customTemplate?: TemplateRef<any>;
  
  // Query for all action buttons
  @ContentChildren(CardActionDirective) actions!: QueryList<CardActionDirective>;
  
  hasHeader = false;
  hasFooter = false;
  
  ngAfterContentInit() {
    console.log('🎯 Content initialized');
    console.log('Actions found:', this.actions.length);
    this.checkContentProjection();
  }
  
  ngAfterContentChecked() {
    
    this.checkContentProjection();
  }
  
  private checkContentProjection() {
   
    this.hasHeader = true; 
    this.hasFooter = true;
  }
}