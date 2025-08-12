import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorLayoutBooking } from './floor-layout.booking';

describe('FloorLayoutBooking', () => {
  let component: FloorLayoutBooking;
  let fixture: ComponentFixture<FloorLayoutBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorLayoutBooking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorLayoutBooking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
