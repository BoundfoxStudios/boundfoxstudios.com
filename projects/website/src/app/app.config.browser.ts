import { mergeApplicationConfig } from '@angular/core';

import { provideAnalytics } from './analytics/analytics.service';
import { appConfig } from './app.config';

export const browserConfig = mergeApplicationConfig(appConfig, {
  providers: [provideAnalytics()],
});
