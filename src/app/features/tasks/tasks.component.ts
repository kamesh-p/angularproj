import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../core/services/state.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {
  private stateService = inject(StateService);
  readonly tasks = this.stateService.tasks;
    readonly searchValue = this.stateService.currentSearchValue;
    readonly filteredTasks = computed(() => {
    const searchTerm = this.searchValue().toLowerCase().trim();
    const allTasks = this.tasks();
    
    if (!searchTerm) {
      return allTasks; 
    }
    
    return allTasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm) 
      
    );
  });
}