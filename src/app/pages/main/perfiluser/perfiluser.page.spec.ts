import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfiluserPage } from './perfiluser.page';

describe('PerfiluserPage', () => {
  let component: PerfiluserPage;
  let fixture: ComponentFixture<PerfiluserPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfiluserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
