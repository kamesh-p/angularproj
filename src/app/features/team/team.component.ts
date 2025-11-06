import { Component, computed, inject } from '@angular/core';
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
    readonly searchValue = this.stateService.currentSearchValue;
    readonly filteredTeams = computed(() => {
    const searchTerm = this.searchValue().toLowerCase().trim();
    const allTeams = this.teamMembers();
    
    if (!searchTerm) {
      return allTeams; 
    }
    
    return allTeams.filter(team => 
      team.name.toLowerCase().includes(searchTerm) ||
      team.role.toLowerCase().includes(searchTerm) 
      
    );
  });
}