import { Component, input } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-user-profile-overview',
  imports: [NzDropDownModule, NzAvatarModule, NzIconModule],
  templateUrl: './user-profile-overview.component.html',
  styleUrl: './user-profile-overview.component.scss'
})
export class UserProfileOverviewComponent {
  isCollapsed = input<boolean>();
}
