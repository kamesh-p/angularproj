// src/app/shared/directives/if-authenticated.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy, effect, inject } from '@angular/core';
import { StateService } from '../../core/services/state.service';

@Directive({
  selector: '[ifAuthenticated]',
  standalone: true
})
export class IfAuthenticatedDirective implements OnDestroy {
  private hasView = false;
  private stateService = inject(StateService);

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {
    // Use effect to reactively respond to authentication changes
    effect(() => {
      const isAuthenticated = !!this.stateService.currentUser();
      this.updateView(isAuthenticated);
    });
  }

  private updateView(show: boolean): void {
    if (show && !this.hasView) {
      // Create embedded view if authenticated and view doesn't exist
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!show && this.hasView) {
      // Clear view if not authenticated and view exists
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  ngOnDestroy(): void {
    // Cleanup
    this.viewContainer.clear();
  }
}