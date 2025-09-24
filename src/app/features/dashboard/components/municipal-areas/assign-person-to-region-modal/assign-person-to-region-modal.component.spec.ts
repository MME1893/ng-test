import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignPersonToRegionModalComponent } from './assign-person-to-region-modal.component';

describe('AssignPersonToRegionModalComponent', () => {
  let component: AssignPersonToRegionModalComponent;
  let fixture: ComponentFixture<AssignPersonToRegionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignPersonToRegionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignPersonToRegionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
