import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCartPage } from './show-cart-page';

describe('ShowCartPage', () => {
  let component: ShowCartPage;
  let fixture: ComponentFixture<ShowCartPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowCartPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowCartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
