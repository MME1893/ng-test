import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-recent-activities',
  imports: [NzCardModule, NzIconModule],
  templateUrl: './recent-activities.component.html',
  styleUrl: './recent-activities.component.scss'
})
export class RecentActivitiesComponent {
  activities = [
    {
      title: 'طرف‌حساب جدید اضافه شد',
      description: 'شرکت سهامی آب منطقه‌ای',
      time: '۲ ساعت پیش',
      icon: 'user'
    },
    {
      title: 'بانک جدید ثبت شد',
      description: 'بانک ملی ایران - شعبه مرکزی',
      time: '۵ ساعت پیش',
      icon: 'bank'
    },
    {
      title: 'سال مالی جدید ایجاد شد',
      description: 'سال 1404',
      time: '۱ روز پیش',
      icon: 'calendar'
    }
  ];
}
