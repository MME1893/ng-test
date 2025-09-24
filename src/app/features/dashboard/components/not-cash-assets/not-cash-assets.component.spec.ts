import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotCashAssetsComponent } from './not-cash-assets.component';

describe('NotCashAssetsComponent', () => {
  let component: NotCashAssetsComponent;
  let fixture: ComponentFixture<NotCashAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotCashAssetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotCashAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
