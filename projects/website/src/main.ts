/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { browserConfig } from './app/app.config.browser';
import { App } from './app/app';

bootstrapApplication(App, browserConfig).catch((error: unknown) => {
  console.error(error);
});
