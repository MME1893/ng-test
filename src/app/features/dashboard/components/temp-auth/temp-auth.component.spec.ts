import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TempAuthComponent } from './temp-auth.component';

describe('TempAuthComponent', () => {
  let component: TempAuthComponent;
  let fixture: ComponentFixture<TempAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TempAuthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TempAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
