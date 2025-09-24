import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TempAuthComponent } from './temp-auth.component';

describe('TempAuthComponent', () => {
  let component: TempAuthComponent;
  let fixture: ComponentFixture<TempAuthComponent>;
  let originalFetch: typeof fetch | undefined;

  beforeEach(() => {
    originalFetch = (globalThis as any).fetch;
    (globalThis as any).fetch = jasmine.createSpy('fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve('[]')
      })
    );
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TempAuthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TempAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    (globalThis as any).fetch = originalFetch as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
