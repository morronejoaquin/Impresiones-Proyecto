import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceCalculatorPage } from './price-calculator-page';

describe('PriceCalculatorPage', () => {
  let component: PriceCalculatorPage;
  let fixture: ComponentFixture<PriceCalculatorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceCalculatorPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceCalculatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
