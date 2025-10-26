import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRegisterPage } from './user-register-page';

describe('UserRegisterPage', () => {
  let component: UserRegisterPage;
  let fixture: ComponentFixture<UserRegisterPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRegisterPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
