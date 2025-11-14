import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationDisplay } from './notification-display';

describe('NotificationDisplay', () => {
  let component: NotificationDisplay;
  let fixture: ComponentFixture<NotificationDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
