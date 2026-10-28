export type SeoSchemaType = "WebPage" | "AboutPage" | "ContactPage" | "Article";

export interface RouteSeoConfig {
  path: string;
  title: string;
  analyticsTitle: string;
  pageName: string;
  description: string;
  indexable: boolean;
  imagePath: string;
  imageAlt: string;
  schemaType: SeoSchemaType;
  publishedTime?: string;
  modifiedTime?: string;
}
