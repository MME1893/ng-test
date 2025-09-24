import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialYearComponent } from './financial-year.component';

describe('FinancialYearComponent', () => {
  let component: FinancialYearComponent;
  let fixture: ComponentFixture<FinancialYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialYearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
