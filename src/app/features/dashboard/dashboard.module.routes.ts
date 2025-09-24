import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'main'
      },
      {
        path: 'main',
        title: 'سیستم مدیریت مالی شهرداری',
        loadComponent: () =>
          import('./components/main/main.component').then(
            (c) => c.MainComponent
          )
      },
      {
        path: 'financial-year',
        title: 'مدیریت سال مالی',
        loadComponent: () =>
          import('./components/financial-year/financial-year.component').then(
            (c) => c.FinancialYearComponent
          )
      },
      {
        path: 'bank-account-group',
        title: 'مدیریت گروه حساب بانکی',
        loadComponent: () =>
          import('./components/bank-account-group/bank-account-group.component').then(
            (c) => c.BankAccountGroupComponent
          )
      },
      {
        path: 'banks',
        title: 'مدیریت بانک ها',
        loadComponent: () =>
          import('./components/banks/banks.component').then(
            (c) => c.BanksComponent
          )
      },
      {
        path: 'municipal-areas',
        title: 'مدیریت مناطق شهرداری',
        loadComponent: () =>
          import('./components/municipal-areas/municipal-areas.component').then(
            (c) => c.MunicipalAreasComponent
          )
      },
      {
        path: 'municipal-orgs',
        title: 'مدیریت سازمان های شهرداری',
        loadComponent: () =>
          import('./components/municipal-orgs/municipal-orgs.component').then(
            (c) => c.MunicipalOrgsComponent
          )
      },
      {
        path: 'municipal-companies',
        title: 'مدیدریت شرکت های شهرداری',
        loadComponent: () =>
          import('./components/municipal-companies/municipal-companies.component').then(
            (c) => c.MunicipalCompaniesComponent
          )
      },
      {
        path: 'partners',
        title: 'مدیریت افراد',
        loadComponent: () =>
          import('./components/partners/partners.component').then(
            (c) => c.PartnersComponent
          )
      },
      {
        path: 'accounting-ledger',
        title: 'سرفصل حسابداری',
        loadComponent: () =>
          import('./components/accounting-headers/accounting-headers.component').then(
            (c) => c.AccountingHeadersComponent
          )
      },
      {
        path: 'area-fund-percentage',
        title: 'درصد صندوق ذخیره مناطق',
        loadComponent: () =>
          import('./components/area-reserve-percentage/area-reserve-percentage.component').then(
            (c) => c.AreaReservePercentageComponent
          )
      },
      {
        path: 'org-fund-percentage',
        title: 'درصد صندوق ذخیره سازمان ها',
        loadComponent: () =>
          import('./components/org-reserve-percentage/org-reserve-percentage.component').then(
            (c) => c.OrgReservePercentageComponent
          )
      },
      {
        path: 'contribution',
        title: 'مدیریت همکاری ها',
        loadComponent: () =>
          import('./components/central-share/central-share.component').then(
            (c) => c.CentralShareComponent
          )
      },
      // {
      //   path: 'central-share',
      //   title: 'سهم متمرکز',
      //   loadComponent: () =>
      //     import('./components/central-share/central-share.component').then(
      //       (c) => c.CentralShareComponent
      //     )
      // },
      {
        path: 'bus-share',
        title: 'سهم اتوبوسرانی',
        loadComponent: () =>
          import('./components/bus-share/bus-share.component').then(
            (c) => c.BusShareComponent
          )
      },
      {
        path: 'non-cash-assets',
        title: 'دارایی های غیرنقدی',
        loadComponent: () => import('./components/not-cash-assets/not-cash-assets.component').then(c => c.NotCashAssetsComponent)
      },
      {
        path: 'beginning-period-balance',
        title: 'مانده ابتدای دوره',
        loadComponent: () => import('./components/beginning-period-balance/beginning-period-balance.component').then(c => c.BeginningPeriodBalanceComponent)
      },
      {
        path: 'fund-transfer',
        title: 'جا به جایی وجه',
        loadComponent: () => import('./components/fund-transfer/fund-transfer.component').then(c => c.FundTransferComponent)
      },
      {
        path: 'temp-auth',
        title: 'احراز هویت',
        loadComponent: () => import('./components/temp-auth/temp-auth.component').then(c => c.TempAuthComponent)
      }
    ]
  }
];
