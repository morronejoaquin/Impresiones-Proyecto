import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeOrderPage } from './make-order-page';

describe('MakeOrderPage', () => {
  let component: MakeOrderPage;
  let fixture: ComponentFixture<MakeOrderPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakeOrderPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MakeOrderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
