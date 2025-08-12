import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeskCardComponent } from './desk-card.component';

describe('DeskCardComponent', () => {
  let component: DeskCardComponent;
  let fixture: ComponentFixture<DeskCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeskCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeskCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
