import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MunicipalOrgsComponent } from './municipal-orgs.component';

describe('MunicipalOrgsComponent', () => {
  let component: MunicipalOrgsComponent;
  let fixture: ComponentFixture<MunicipalOrgsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MunicipalOrgsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MunicipalOrgsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
