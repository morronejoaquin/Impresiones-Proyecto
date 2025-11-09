import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceAdmin } from './price-admin';

describe('PriceAdmin', () => {
  let component: PriceAdmin;
  let fixture: ComponentFixture<PriceAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
