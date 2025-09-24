import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeginningPeriodBalanceComponent } from './beginning-period-balance.component';

describe('BeginningPeriodBalanceComponent', () => {
  let component: BeginningPeriodBalanceComponent;
  let fixture: ComponentFixture<BeginningPeriodBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeginningPeriodBalanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeginningPeriodBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
