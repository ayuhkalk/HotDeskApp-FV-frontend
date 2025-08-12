import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorLayout } from './floor-layout';

describe('FloorLayout', () => {
  let component: FloorLayout;
  let fixture: ComponentFixture<FloorLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
