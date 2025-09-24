import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingHeadersComponent } from './accounting-headers.component';

describe('AccountingHeadersComponent', () => {
  let component: AccountingHeadersComponent;
  let fixture: ComponentFixture<AccountingHeadersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountingHeadersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountingHeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
