import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bfs-button-primary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './button-primary.html',
})
export class ButtonPrimary {
  readonly href = input<string | null>(null);
  readonly route = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
}
