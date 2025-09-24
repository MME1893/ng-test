import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgReservePercentageComponent } from './org-reserve-percentage.component';

describe('OrgReservePercentageComponent', () => {
  let component: OrgReservePercentageComponent;
  let fixture: ComponentFixture<OrgReservePercentageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgReservePercentageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgReservePercentageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
