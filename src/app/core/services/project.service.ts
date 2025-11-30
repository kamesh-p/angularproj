import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CreateProjectRequest, Project } from '../../shared/models';

// import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/projects';

  createProject(projectData: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, projectData).pipe(
      catchError(this.handleError)
    );
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  updateProject(id: string, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.status === 400) {
      errorMessage = 'Invalid project data. Please check your input.';
    } else if (error.status === 0) {
      errorMessage = 'Network error: Please check your connection.';
    } else {
      errorMessage = error.error?.message || `Server error: ${error.status}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}