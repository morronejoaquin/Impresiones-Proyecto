import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderListPage } from './order-list-page';

describe('OrderListPage', () => {
  let component: OrderListPage;
  let fixture: ComponentFixture<OrderListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
