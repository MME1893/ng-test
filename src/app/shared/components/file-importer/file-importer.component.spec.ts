import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileImporterComponent } from './file-importer.component';

describe('FileImporterComponent', () => {
  let component: FileImporterComponent;
  let fixture: ComponentFixture<FileImporterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileImporterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileImporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
