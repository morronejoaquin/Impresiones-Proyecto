import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartPaymentPage } from './cart-payment-page';

describe('CartPaymentPage', () => {
  let component: CartPaymentPage;
  let fixture: ComponentFixture<CartPaymentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartPaymentPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartPaymentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
