import { Component, input, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-action-card',
  imports: [NzCardModule, NzButtonComponent, NzIconModule],
  templateUrl: './action-card.component.html',
  styleUrl: './action-card.component.scss'
})
export class ActionCardComponent {
  icon = input.required<string>();
  title = input.required<string>();
  description = input.required<string>();
  infoText = input.required<string>();
  buttonText = input.required<string>();
  buttonClick = output<void>();

  onButtonClick(): void {
    this.buttonClick.emit();
  }
}
