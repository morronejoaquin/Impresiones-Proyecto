import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartEditPage } from './cart-edit-page';

describe('CartEditPage', () => {
  let component: CartEditPage;
  let fixture: ComponentFixture<CartEditPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartEditPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
