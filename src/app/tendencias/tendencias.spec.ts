import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tendencias } from './tendencias';

describe('Tendencias', () => {
  let component: Tendencias;
  let fixture: ComponentFixture<Tendencias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tendencias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tendencias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
