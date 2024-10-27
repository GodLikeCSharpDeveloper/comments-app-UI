import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyMakerComponent } from './reply-maker.component';

describe('ReplyMakerComponent', () => {
  let component: ReplyMakerComponent;
  let fixture: ComponentFixture<ReplyMakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplyMakerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplyMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
