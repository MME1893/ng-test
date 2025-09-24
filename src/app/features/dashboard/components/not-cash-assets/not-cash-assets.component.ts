import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// NG-ZORRO Modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationService } from 'ng-zorro-antd/notification';

// Import Leaflet
import * as L from 'leaflet';

@Component({
  selector: 'app-not-cash-assets', // Added selector
  standalone: true, // Added standalone flag
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzFormModule,
    NzSelectModule,
    NzGridModule,
    NzDividerModule,
    NzDatePickerModule,
  ],
  templateUrl: './not-cash-assets.component.html',
  styleUrl: './not-cash-assets.component.scss',
})
export class NotCashAssetsComponent implements OnInit, AfterViewInit { // Added OnInit
  assetForm!: FormGroup;
  private map: any;

  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.assetForm = this.fb.group({
      // First section
      propertySeparationCode: [null],
      registrationPlate: [null],
      sector: [null],
      address: [null],
      geographicalArea: [null],
      transferDate: [null],
      transferOrderNumber: [null],
      plotNumber: [null],
      usageType: [null],
      // Second section
      propertyStatus: [null],
      area: [null],
      buildingArea: [null],
      purchaseDate: [null],
      purchasePrice: [null],
      transferDate2: [null],
      transferPrice: [null],
      transferType: [null],
      renovationCode: [null],
      purchasedFrom: [null],
      soldTo: [null],
      accountingCode: [null],
    });
  }

  ngAfterViewInit(): void {
    // A small delay can sometimes help ensure the container is fully rendered
    setTimeout(() => this.initMap(), 0);
  }

  private initMap(): void {
    // Set initial map view to Isfahan
    this.map = L.map('map', {
      center: [32.6546, 51.6679],
      zoom: 13,
    });

    // Add the tile layer from OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    // Add a marker to the map
    L.marker([32.6546, 51.6679])
      .addTo(this.map)
      .bindPopup('مکان دارایی')
      .openPopup();
  }

  submitForm(): void {
    if (this.assetForm.valid) {
      console.log('Form Submitted:', this.assetForm.value);
      this.notification.success('موفق', 'دارایی غیر نقدی با موفقیت ذخیره شد.');
    } else {
      Object.values(this.assetForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}