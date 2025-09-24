import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateShareModalComponent } from './create-share-modal.component';

describe('CreateShareModalComponent', () => {
  let component: CreateShareModalComponent;
  let fixture: ComponentFixture<CreateShareModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateShareModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateShareModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
