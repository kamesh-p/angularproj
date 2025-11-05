import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../core/services/state.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  private stateService = inject(StateService);
  readonly currentUser = this.stateService.currentUser;
}