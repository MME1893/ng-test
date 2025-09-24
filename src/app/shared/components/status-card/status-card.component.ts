import { Component, input } from '@angular/core';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

@Component({
  selector: 'app-status-card',
  imports: [NzCardComponent, NzStatisticModule, NzIconModule],
  templateUrl: './status-card.component.html',
  styleUrl: './status-card.component.scss',
})
export class StatusCardComponent {
  icon = input<string>();
  title = input.required<string>();
  value = input.required<string>();
  subtitle = input.required<string>();
}
