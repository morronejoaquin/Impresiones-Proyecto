import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WherePage } from './where-page';

describe('WherePage', () => {
  let component: WherePage;
  let fixture: ComponentFixture<WherePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WherePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WherePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
