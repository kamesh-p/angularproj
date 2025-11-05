import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../core/services/state.service';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormatDatePipe],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  private stateService = inject(StateService);
  readonly projects = this.stateService.projects;
}