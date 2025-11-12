import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { StateService } from '../../core/services/state.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  private stateService = inject(StateService);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  
  readonly currentUser = this.stateService.currentUser;
  
  // Firebase REST API URL
  private firebaseUrl = 'https://food-app-http-request-default-rtdb.firebaseio.com';


  
  readonly avatarOptions = [
    { emoji: '👤', label: 'Default' },
    { emoji: '🐱', label: 'Cat' },
    { emoji: '🌟', label: 'Star' }
  ];

  readonly statusOptions = [
    { value: 'online' as const, label: 'Online', class: 'btn-success' },
    { value: 'offline' as const, label: 'Offline', class: 'btn-secondary' }
  ];

  ngOnInit() {
    // Load current user data via HTTP when component initializes
    if (this.currentUser()?.id) {
      this.loadUserProfile(this.currentUser()!.id);
    }
  }

  
  trackByEmoji(index: number, item: { emoji: string; label: string }): string {
    return item.emoji;
  }

 
  trackByValue(index: number, item: { value: string; label: string }): string {
    return item.value;
  }



  loadUserProfile(userId: string) {
    console.log('📡 [PROFILE] Loading user profile via HTTP...', userId);
    
    this.http.get<any>(`${this.firebaseUrl}/users/${userId}.json`)
      .subscribe({
        next: (userData) => {
          console.log('✅ [PROFILE] User profile loaded successfully');
          if (userData) {
            // Signal update automatically triggers change detection with OnPush
            this.stateService.setCurrentUser({ id: userId, ...userData });
          }
          this.toastService.show('Profile loaded', 'success');
        },
        error: (error) => {
          console.error('❌ [PROFILE] Error loading profile:', error);
          this.toastService.show('Failed to load profile', 'error');
        }
      });
  }

  updateProfile(updates: any) {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    console.log('📝 [PROFILE] Updating profile via HTTP...', updates);
    
    this.http.patch(`${this.firebaseUrl}/users/${userId}.json`, updates)
      .subscribe({
        next: () => {
          console.log('✅ [PROFILE] Profile updated successfully');
          // Using spread operator to create new object reference
          // This is important for OnPush strategy to detect changes
          const updatedUser = { ...this.currentUser()!, ...updates };
          this.stateService.setCurrentUser(updatedUser);
          this.toastService.show('Profile updated successfully', 'success');
        },
        error: (error) => {
          console.error('❌ [PROFILE] Error updating profile:', error);
          this.toastService.show('Failed to update profile', 'error');
        }
      });
  }

  changeAvatar(newAvatar: string) {
    console.log('🎨 [PROFILE] Changing avatar...');
    this.updateProfile({ avatar: newAvatar });
  }

  changeStatus(newStatus: 'online' | 'offline') {
    console.log('🟢 [PROFILE] Changing status...');
    this.updateProfile({ status: newStatus });
  }

  refreshProfile() {
    const userId = this.currentUser()?.id;
    if (userId) {
      console.log('🔄 [PROFILE] Refreshing profile...');
      this.loadUserProfile(userId);
    }
  }
}

