import { TestBed } from '@angular/core/testing';

import { Desk } from './desk';

describe('Desk', () => {
  let service: Desk;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Desk);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
