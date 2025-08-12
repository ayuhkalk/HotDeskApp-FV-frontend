import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Desk } from '../core/models/desk.model';

@Component({
  selector: 'app-desk-card',
  template: `
    <div 
      class="desk-card"
      [class.selected]="isSelected"
      (click)="onSelect()">
      <div class="desk-number">{{ desk.number }}</div>
      <div class="desk-location">{{ desk.location }}</div>
      <div class="desk-features">{{ desk.features }}</div>
      <div class="desk-status" [class.selected]="isSelected">
        {{ isSelected ? 'Selected' : 'Available' }}
      </div>
    </div>
  `,
  styleUrls: ['./desk-card.component.css']
})
export class DeskCardComponent {
  @Input() desk!: Desk;
  @Input() isSelected = false;
  @Output() selected = new EventEmitter<Desk>();

  onSelect() {
    this.selected.emit(this.desk);
  }
}
