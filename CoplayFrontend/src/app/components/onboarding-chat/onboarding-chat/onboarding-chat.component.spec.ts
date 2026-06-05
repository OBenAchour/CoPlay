import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingChatComponent } from './onboarding-chat.component';

describe('OnboardingChatComponent', () => {
  let component: OnboardingChatComponent;
  let fixture: ComponentFixture<OnboardingChatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnboardingChatComponent]
    });
    fixture = TestBed.createComponent(OnboardingChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
