import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalLoadingComponent } from './global-loading.component';

describe('GlobalLoadingComponent', () => {
  let component: GlobalLoadingComponent;
  let fixture: ComponentFixture<GlobalLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
