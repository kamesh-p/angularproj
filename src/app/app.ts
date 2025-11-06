import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, ModalComponent,HttpClientModule],
  templateUrl: './app.html',
  styleUrls: ['./app.component.scss']
})
export class App {
  title = 'TaskFlow';
}