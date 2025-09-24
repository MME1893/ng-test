import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [NzGridModule, CommonModule, NzIconModule, NzMenuModule, NzLayoutModule, NzButtonModule, NzToolTipModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent implements OnInit {
  collapsed = false;
  isMobile = false;
  private readonly mobileBreakpoint = 1024;

  get collapsedWidth(): number {
    return this.isMobile ? 0 : 80;
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const isNowMobile = window.innerWidth < this.mobileBreakpoint;
    
    if (this.isMobile !== isNowMobile) {
      this.isMobile = isNowMobile;
      this.collapsed = this.isMobile;
    }
  }

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }
}