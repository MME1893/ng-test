import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialYearSelectorComponent } from './financial-year-selector.component';

describe('FinancialYearSelectorComponent', () => {
  let component: FinancialYearSelectorComponent;
  let fixture: ComponentFixture<FinancialYearSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialYearSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialYearSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
