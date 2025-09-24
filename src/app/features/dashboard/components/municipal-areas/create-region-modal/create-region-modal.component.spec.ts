import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRegionModalComponent } from './create-region-modal.component';

describe('CreateRegionModalComponent', () => {
  let component: CreateRegionModalComponent;
  let fixture: ComponentFixture<CreateRegionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRegionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRegionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
