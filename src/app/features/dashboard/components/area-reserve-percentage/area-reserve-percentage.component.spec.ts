import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaReservePercentageComponent } from './area-reserve-percentage.component';

describe('AreaReservePercentageComponent', () => {
  let component: AreaReservePercentageComponent;
  let fixture: ComponentFixture<AreaReservePercentageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaReservePercentageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaReservePercentageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
