import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountGroupComponent } from './bank-account-group.component';

describe('BankAccountGroupComponent', () => {
  let component: BankAccountGroupComponent;
  let fixture: ComponentFixture<BankAccountGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankAccountGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankAccountGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
