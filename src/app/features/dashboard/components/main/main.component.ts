import { Component } from '@angular/core';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ActionCardComponent } from '../../../../shared/components/action-card/action-card.component';
import { Router } from '@angular/router';
import { RecentActivitiesComponent } from './components/recent-activities/recent-activities.component';

@Component({
  selector: 'app-main',
  imports: [StatusCardComponent, NzGridModule, ActionCardComponent, RecentActivitiesComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

  constructor(private readonly router: Router) {}

  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }
}
