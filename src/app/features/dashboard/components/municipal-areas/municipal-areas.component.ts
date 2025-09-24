import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

// NG-ZORRO Modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { environment } from '../../../../../environments/environment';
import { Person } from '../../../../shared/models/person.model';
import { JobPostType } from '../../../../shared/models/jobs.model';
import { Region } from '../../../../shared/models/region.model';
import { RegionStore } from '../../../../shared/stores/region/region-store.service';
import { PageLayoutComponent } from '../../../../layouts/page-layout/page-layout.component';
import { CreateRegionModalComponent } from './create-region-modal/create-region-modal.component';
import { AssignPersonToRegionModalComponent } from './assign-person-to-region-modal/assign-person-to-region-modal.component';

@Component({
  selector: 'app-municipal-areas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzTableModule,
    NzSelectModule,
    NzPopconfirmModule,
    NzDividerModule,
    PageLayoutComponent,
    CreateRegionModalComponent,
    AssignPersonToRegionModalComponent,
  ],
  templateUrl: './municipal-areas.component.html',
  styleUrls: ['./municipal-areas.component.scss'],
})
export class MunicipalAreasComponent {
  //new start
  public readonly vm;
  public isCreateRegionModalVisible = signal<boolean>(false);
  public isAssignmentModalVisible = signal<boolean>(false);

  toggleCreateRegionModalVisibility(): void {
    this.isCreateRegionModalVisible.update(pValue => !pValue);
  }

  toggleAssingModalVisibility(): void {
    this.isAssignmentModalVisible.update(pValue => !pValue);
  }

  constructor(
    private readonly regionStore: RegionStore
  ) {
    this.vm = this.regionStore.vm;
  }

  private validateForm(form: FormGroup): void {
    Object.values(form.controls).forEach((control) => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  deleteRegion(regionId: number): void {
    this.regionStore.deleteRegion(regionId);
  }
}