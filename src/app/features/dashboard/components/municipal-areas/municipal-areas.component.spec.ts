import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MunicipalAreasComponent } from './municipal-areas.component';

describe('MunicipalAreasComponent', () => {
  let component: MunicipalAreasComponent;
  let fixture: ComponentFixture<MunicipalAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MunicipalAreasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MunicipalAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
