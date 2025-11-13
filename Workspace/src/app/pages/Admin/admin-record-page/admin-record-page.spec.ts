import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRecordPage } from './admin-record-page';

describe('AdminRecordPage', () => {
  let component: AdminRecordPage;
  let fixture: ComponentFixture<AdminRecordPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRecordPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRecordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
