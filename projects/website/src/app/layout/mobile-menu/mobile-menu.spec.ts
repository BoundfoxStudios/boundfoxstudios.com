import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { MobileMenu } from './mobile-menu';

@Component({ template: '' })
class TestPage {}

describe('MobileMenu', () => {
  let fixture: ComponentFixture<MobileMenu>;
  let toggle: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileMenu],
      providers: [
        provideRouter([{ path: 'support', component: TestPage }]),
        provideLocationMocks(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileMenu);
    fixture.detectChanges();

    toggle = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    toggle.focus();
  });

  it('moves focus into the panel when it opens', () => {
    toggle.click();
    fixture.detectChanges();

    const panel = document.getElementById('mobile-menu-panel');

    expect(panel).not.toBeNull();
    expect(panel!.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape and returns focus to the toggle', () => {
    toggle.click();
    fixture.detectChanges();

    // The CDK keyboard dispatcher listens on `body`, so the event has to bubble up from inside.
    document
      .getElementById('mobile-menu-panel')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(document.getElementById('mobile-menu-panel')).toBeNull();
    expect(document.activeElement).toBe(toggle);
  });

  it('closes when a navigation completes', async () => {
    toggle.click();
    fixture.detectChanges();

    await TestBed.inject(Router).navigate(['/support']);
    fixture.detectChanges();

    expect(document.getElementById('mobile-menu-panel')).toBeNull();
  });
});
