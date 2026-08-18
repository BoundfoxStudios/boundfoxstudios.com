import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  NavigationSkipped,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter } from 'rxjs';

import { LocaleLinks } from '../../seo/locale-links';
import { LanguageSwitcher } from '../site-header/language-switcher';

const DESKTOP_MEDIA_QUERY = '(min-width: 768px)';
const PANEL_TOP_OFFSET = '64px';

@Component({
  selector: 'bfs-mobile-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkTrapFocus, LanguageSwitcher, RouterLink, RouterLinkActive],
  templateUrl: './mobile-menu.html',
})
export class MobileMenu {
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');

  private overlayRef: OverlayRef | null = null;

  protected readonly localeLinks = inject(LocaleLinks);
  protected readonly isOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        // Tapping the link of the route you are already on emits NavigationSkipped, which would
        // otherwise leave the panel covering the page it just failed to navigate to.
        filter(event => event instanceof NavigationEnd || event instanceof NavigationSkipped),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.close();
      });

    // Prerendering must never touch `window`; afterRender hooks never run on the server.
    afterNextRender(() => {
      const desktop = window.matchMedia(DESKTOP_MEDIA_QUERY);
      const closeWhenDesktop = (event: MediaQueryListEvent): void => {
        if (event.matches) {
          this.close();
        }
      };

      desktop.addEventListener('change', closeWhenDesktop);
      this.destroyRef.onDestroy(() => {
        desktop.removeEventListener('change', closeWhenDesktop);
      });
    });

    this.destroyRef.onDestroy(() => {
      this.overlayRef?.dispose();
    });
  }

  protected toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  private open(): void {
    const overlayRef = this.overlayRef ?? this.createOverlayRef();
    const viewRef = overlayRef.attach(
      new TemplatePortal(this.panelTemplate(), this.viewContainerRef),
    );
    const [panelElement] = viewRef.rootNodes as HTMLElement[];

    // jsdom reports offsetWidth 0, so the CDK trap finds nothing tabbable; focusing the panel
    // itself is what makes the open behaviour testable.
    panelElement.focus();
    this.isOpen.set(true);
  }

  private close(): void {
    if (!this.overlayRef?.hasAttached()) {
      return;
    }

    this.isOpen.set(false);
    this.overlayRef.detach();
  }

  private createOverlayRef(): OverlayRef {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().top(PANEL_TOP_OFFSET).left('0'),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      width: '100%',
    });

    overlayRef
      .backdropClick()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.close();
      });

    overlayRef
      .keydownEvents()
      .pipe(
        filter(event => event.key === 'Escape'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.close();
      });

    this.overlayRef = overlayRef;

    return overlayRef;
  }
}
