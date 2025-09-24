import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { LoadingService } from '../../services/loading/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule, NzSpinModule],
  templateUrl: './global-loading.component.html',
  styleUrls: ['./global-loading.component.scss'],
})
export class GlobalLoadingComponent {
  isLoading$;
  constructor(private loadingService: LoadingService) {
    this.isLoading$ = this.loadingService.loading$;
  }
}
