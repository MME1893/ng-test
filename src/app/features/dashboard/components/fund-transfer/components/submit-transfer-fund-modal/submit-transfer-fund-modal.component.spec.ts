import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitTransferFundModalComponent } from './submit-transfer-fund-modal.component';

describe('SubmitTransferFundModalComponent', () => {
  let component: SubmitTransferFundModalComponent;
  let fixture: ComponentFixture<SubmitTransferFundModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitTransferFundModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitTransferFundModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
