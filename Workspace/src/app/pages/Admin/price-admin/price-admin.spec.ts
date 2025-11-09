import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceAdminComponent } from './price-admin';


describe('PriceAdmin', () => {
  let component: PriceAdminComponent;
  let fixture: ComponentFixture<PriceAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
