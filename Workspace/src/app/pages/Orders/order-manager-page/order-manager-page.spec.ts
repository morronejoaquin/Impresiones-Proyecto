import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderManagerPage } from './order-manager-page';

describe('OrderManagerPage', () => {
  let component: OrderManagerPage;
  let fixture: ComponentFixture<OrderManagerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderManagerPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderManagerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
