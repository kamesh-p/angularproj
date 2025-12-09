// src/app/features/team/team.component.ts
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../core/services/state.service';
import { AnalyticsService, TeamPerformance } from '../../core/services/analytics.services';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  private stateService = inject(StateService);
  private analyticsService = inject(AnalyticsService);
  
  readonly teamMembers = this.stateService.teamMembers;
  readonly searchValue = this.stateService.currentSearchValue;
  
  // NEW: Team performance analytics
  readonly teamPerformance = signal<TeamPerformance[]>([]);
  readonly isLoadingPerformance = signal<boolean>(false);
  
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

  ngOnInit() {
    this.loadTeamPerformance();
  }

  /**
   * Load team performance metrics from JdbcTemplate
   */
  loadTeamPerformance(): void {
    console.log('📊 [TEAM] Loading team performance metrics...');
    this.isLoadingPerformance.set(true);

    this.analyticsService.getTeamPerformance().subscribe({
      next: (performance) => {
        this.teamPerformance.set(performance);
        console.log('✅ [TEAM] Performance metrics loaded for', performance.length, 'members');
      },
      error: (error) => {
        console.error('❌ [TEAM] Error loading performance:', error);
      },
      complete: () => {
        this.isLoadingPerformance.set(false);
      }
    });
  }

  /**
   * Get performance data for a specific team member
   */
  getPerformanceForMember(userId: string): TeamPerformance | undefined {
    return this.teamPerformance().find(p => p.userId === userId);
  }

  /**
   * Get performance indicator class based on success rate
   */
  getPerformanceClass(successRate: number): string {
    if (successRate >= 80) return 'performance-excellent';
    if (successRate >= 60) return 'performance-good';
    if (successRate >= 40) return 'performance-average';
    return 'performance-needs-improvement';
  }
}