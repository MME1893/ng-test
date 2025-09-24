import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
  selector: 'app-page-layout',
  imports: [
    CommonModule,
    NzLayoutModule,
    NzBackTopModule,
    NzCardModule,
    NzDividerModule
  ],
  templateUrl: './page-layout.component.html',
  styleUrl: './page-layout.component.scss'
})
export class PageLayoutComponent {

}
