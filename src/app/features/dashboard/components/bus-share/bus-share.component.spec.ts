import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusShareComponent } from './bus-share.component';

describe('BusShareComponent', () => {
  let component: BusShareComponent;
  let fixture: ComponentFixture<BusShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusShareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
