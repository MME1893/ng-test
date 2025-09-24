import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { dashboardRoutes } from './dashboard.module.routes';
import { DashboardComponent } from './dashboard.component';
import { DashboardLayoutComponent } from '../../layouts/dashboard/dashboard-layout.component';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserProfileOverviewComponent } from '../../shared/components/user-profile-overview/user-profile-overview.component';
import { StatusCardComponent } from '../../shared/components/status-card/status-card.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FinancialYearSelectorComponent } from '../../shared/components/financial-year-selector/financial-year-selector.component';



@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(dashboardRoutes),
    DashboardLayoutComponent,
    NzMenuModule,
    NzIconModule,
    UserProfileOverviewComponent,
    StatusCardComponent,
    NzToolTipModule,
    NzButtonModule,
    FinancialYearSelectorComponent
  ]
})
export class DashboardModule { }
