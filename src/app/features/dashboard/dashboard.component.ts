import { Component, effect, signal, Signal } from '@angular/core';
import { MenuItem, menuItems } from './constants';
import { ThemeService, ThemeType } from '../../shared/services/theme/theme.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DashboardMenuService } from '../../shared/services/dashboard-menu/dashboard-menu.service';
import { FinancialYearStore } from '../../shared/stores/financial-year/financial-year.service';
import { dynamicMenuItem } from '../../shared/models/menu.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public readonly menuItems = signal<MenuItem[]>(menuItems);
  public isDark: Signal<ThemeType | undefined>;

  constructor(
    private readonly themeService: ThemeService,
    private readonly dashboardMenuService: DashboardMenuService,
    private readonly finYearStore: FinancialYearStore,
  ) {
    this.isDark = toSignal(this.themeService.currentTheme);
    const finYear = this.finYearStore.vm().selectedYear;
    if (finYear) this.getDynamicMenuItems(finYear);
    // effect(() => {
    //   const finYear = this.finYearStore.vm().selectedYear;
    //   if (finYear) this.getDynamicMenuItems(finYear);
    // });
  }

  getDynamicMenuItems(finYear: number): void {
    this.dashboardMenuService.getDynamicMenuItems(finYear).subscribe(res => {
      res.forEach(item => this.menuItems()[1].children?.push(this.transformDynamicItemToMenuItem(item)));
    })
  }

  transformDynamicItemToMenuItem(item: dynamicMenuItem) {
    return {
      title: item.name,
      link: '/dashboard/contribution',
      data: {
        party_type_id: item.party_type_id,
        amnt_or_prcntg: item.amnt_or_prcntg,
        contribution_id: item.id
      }
    } as MenuItem;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
