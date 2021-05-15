import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalsUpdateComponent } from './portals-update.component';

describe('PortalsUpdateComponent', () => {
  let component: PortalsUpdateComponent;
  let fixture: ComponentFixture<PortalsUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortalsUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalsUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
