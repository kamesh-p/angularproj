import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  readonly modalService = inject(ModalService);
}