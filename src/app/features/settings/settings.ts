// src/app/features/settings/settings.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/theme';

  currentTheme: any = null;
  appInfo: any = null;
  selectedThemeName = 'light';

  ngOnInit() {
    this.loadTheme('light');
    this.loadAppInfo();
  }

  loadTheme(themeName: string) {
    this.http.get<any>(`${this.apiUrl}/${themeName}`).subscribe({
      next: (theme) => {
        console.log('✅ Theme loaded:', theme);
        this.currentTheme = theme;
        this.selectedThemeName = themeName;
        this.applyTheme(theme);
      },
      error: (err) => console.error('❌ Error loading theme:', err)
    });
  }

  loadAppInfo() {
    this.http.get<any>(`${this.apiUrl}/info`).subscribe({
      next: (info) => {
        console.log('✅ App info loaded:', info);
        this.appInfo = info;
      },
      error: (err) => console.error('❌ Error loading app info:', err)
    });
  }

  applyTheme(theme: any) {
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--background-color', theme.backgroundColor);
    document.documentElement.style.setProperty('--text-color', theme.textColor);
  }

  switchTheme(themeName: string) {
    this.loadTheme(themeName);
  }
}