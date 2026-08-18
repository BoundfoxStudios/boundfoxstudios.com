export interface PageSeo {
  readonly title: string;
  readonly description: string;
  readonly image?: string;
  readonly type?: 'website' | 'article';
  readonly noIndex?: boolean;
}
