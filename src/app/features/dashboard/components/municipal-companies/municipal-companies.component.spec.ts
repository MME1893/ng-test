import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MunicipalCompaniesComponent } from './municipal-companies.component';

describe('MunicipalCompaniesComponent', () => {
  let component: MunicipalCompaniesComponent;
  let fixture: ComponentFixture<MunicipalCompaniesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MunicipalCompaniesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MunicipalCompaniesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
