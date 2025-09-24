import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralShareComponent } from './central-share.component';

describe('CentralShareComponent', () => {
  let component: CentralShareComponent;
  let fixture: ComponentFixture<CentralShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentralShareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentralShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
