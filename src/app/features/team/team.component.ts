import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../core/services/state.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent {
  private stateService = inject(StateService);
  readonly teamMembers = this.stateService.teamMembers;
}