import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { Kicker } from '../kicker/kicker';

export type ProjectCardDensity = 'roomy' | 'compact';
export type ProjectCardMedia = 'pattern' | 'contain' | 'icon' | 'cover';

const MEDIA_PANEL_CLASSES: Record<ProjectCardMedia, string> = {
  pattern:
    'flex items-center justify-center overflow-hidden border-b border-neutral-200 bg-white bg-[linear-gradient(#e5e5e5_1px,transparent_1px),linear-gradient(90deg,#e5e5e5_1px,transparent_1px)] bg-[size:20px_20px]',
  contain: 'flex items-center justify-center overflow-hidden bg-neutral-100',
  icon: 'flex items-center justify-center overflow-hidden bg-neutral-100',
  cover: 'overflow-hidden bg-neutral-100',
};

@Component({
  selector: 'bfs-project-card',
  host: { class: 'contents' },
  imports: [Kicker, NgTemplateOutlet],
  templateUrl: './project-card.html',
})
export class ProjectCard {
  readonly density = input.required<ProjectCardDensity>();
  readonly media = input.required<ProjectCardMedia>();
  readonly kicker = input.required<string>();
  readonly title = input.required<string>();
  readonly platforms = input.required<string>();
  readonly headingLevel = input<2 | 3>(2);

  protected readonly mediaPanelClass = computed(() => {
    const height = this.density() === 'roomy' ? 'h-[200px]' : 'h-[180px]';

    return `${height} ${MEDIA_PANEL_CLASSES[this.media()]}`;
  });
}
