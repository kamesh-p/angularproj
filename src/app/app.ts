import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ModalComponent } from './shared/components/modal/modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, ModalComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.component.scss']
})
export class App {
  title = 'TaskFlow';
}