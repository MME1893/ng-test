import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentActivitiesComponent } from './recent-activities.component';

describe('RecentActivitiesComponent', () => {
  let component: RecentActivitiesComponent;
  let fixture: ComponentFixture<RecentActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentActivitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
