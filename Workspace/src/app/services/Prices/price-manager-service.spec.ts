import { TestBed } from '@angular/core/testing';

import { PriceManagerService } from './price-manager-service';

describe('PriceManagerService', () => {
  let service: PriceManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
