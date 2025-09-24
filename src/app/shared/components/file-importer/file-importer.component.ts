import { NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule, NzButtonType } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-file-importer',
  standalone: true,
  imports: [
    NzButtonModule,
    NzModalModule,
    NzTableModule,
    NzInputModule,
    FormsModule,
    NzIconModule,
    NgFor
  ],
  templateUrl: './file-importer.component.html',
  styleUrl: './file-importer.component.scss'
})
export class FileImporterComponent {
  @Input() buttonText: string = 'ورود اطلاعات از CSV';
  @Input() buttonType: NzButtonType = 'default';
  @Input() uploadUrl: string = 'https://your-api-endpoint.com/upload';

  isModalVisible = false;
  isSubmitting = false;
  headers: string[] = [];
  rows: string[][] = [];
  private originalFile: File | null = null;

  constructor(
    private http: HttpClient,
    private message: NzMessageService,
    private zone: NgZone
  ) { }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.message.error('لطفاً یک فایل CSV معتبر انتخاب کنید.');
      return;
    }

    this.originalFile = file;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.zone.run(() => {
        this.parseCSV(e.target.result);
        this.isModalVisible = true;
      });
    };

    reader.readAsText(file, 'UTF-8');
    input.value = '';
  }

  private parseCSV(text: string): void {
    const lines = text.trim().split(/\r\n|\n/);
    if (lines.length > 0) {
      this.headers = lines[0].split(',').filter(h => h);
      this.rows = lines.slice(1)
        .map(line => line.split(','))
        .filter(row => row.length > 0 && row.some(cell => cell));
    }
  }

  submitData(): void {
    if (!this.originalFile) return;
    this.isSubmitting = true;

    const updatedCsvContent = [
      this.headers.join(','),
      ...this.rows.map(row => row.join(','))
    ].join('\n');

    const updatedFile = new Blob([updatedCsvContent], { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', updatedFile, this.originalFile.name);

    this.http.post(this.uploadUrl, formData).subscribe({
      next: () => {
        this.message.success('فایل با موفقیت بارگذاری شد.');
        this.handleCancel();
      },
      error: (err) => {
        this.message.error('بارگذاری فایل ناموفق بود.');
        console.error('خطای بارگذاری:', err);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.headers = [];
    this.rows = [];
    this.originalFile = null;
  }
}