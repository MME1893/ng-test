import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { GlobalLoadingComponent } from './shared/components/global-loading/global-loading.component';
import { ThemeService } from './shared/services/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalLoadingComponent],
  providers: [NzNotificationService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
