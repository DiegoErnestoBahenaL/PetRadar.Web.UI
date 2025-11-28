import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Surprise } from './surprise';

describe('Surprise', () => {
  let component: Surprise;
  let fixture: ComponentFixture<Surprise>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Surprise]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Surprise);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
