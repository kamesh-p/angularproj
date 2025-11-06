import { Component, inject, computed } from '@angular/core';
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
  readonly searchValue = this.stateService.currentSearchValue;
  
  // Filtered projects based on search value
  readonly filteredProjects = computed(() => {
    const searchTerm = this.searchValue().toLowerCase().trim();
    const allProjects = this.projects();
    
    if (!searchTerm) {
      return allProjects; 
    }
    
    return allProjects.filter(project => 
      project.name.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm) ||
      project.status.toLowerCase().includes(searchTerm)
    );
  });
}