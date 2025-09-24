import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// NG-ZORRO Modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

import { Person } from '../../../../shared/models/person.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzTableModule,
    NzModalModule,
    NzFormModule,
    NzGridModule,
    NzPopconfirmModule,
  ],
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss'],
})
export class PartnersComponent implements OnInit {
  isUserModalVisible = false;
  userForm!: FormGroup;
  persons: Person[] = [];
  private readonly apiUrl = environment.endpoints.person;

  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private readonly http: HttpClient
  ) { }

  ngOnInit(): void {
    this.getPersons();

    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      family: ['', [Validators.required]],
      phone_number: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{11}$/)],
      ],
      national_code: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
    });
  }

  getPersons(): void {
    this.http.get<Person[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.persons = data;
      },
      error: (err) => {
        this.notification.error('خطا', 'دریافت لیست کاربران با مشکل مواجه شد.');
        console.error(err);
      },
    });
  }

  showUserModal(): void {
    this.userForm.reset();
    this.isUserModalVisible = true;
  }

  handleUserOk(): void {
    if (this.userForm.valid) {
      this.http.post<Person>(this.apiUrl, this.userForm.value).subscribe({
        next: () => {
          this.notification.success('موفق', 'کاربر جدید با موفقیت ایجاد شد.');
          this.isUserModalVisible = false;
          this.getPersons(); // Refresh the list
        },
        error: (err) => {
          this.notification.error('خطا', 'ایجاد کاربر جدید با مشکل مواجه شد.');
          console.error(err);
        },
      });
    } else {
      Object.values(this.userForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  handleUserCancel(): void {
    this.isUserModalVisible = false;
  }

  deletePerson(id: number): void {
    const deleteUrl = `${this.apiUrl}${id}/`;
    this.http.delete(deleteUrl).subscribe({
      next: () => {
        this.notification.info('حذف شد', 'کاربر با موفقیت حذف گردید.');
        this.getPersons(); // Refresh the list
      },
      error: (err) => {
        this.notification.error('خطا', 'حذف کاربر با مشکل مواجه شد.');
        console.error(err);
      }
    });
  }
}