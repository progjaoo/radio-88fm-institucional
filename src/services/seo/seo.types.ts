export type SeoSchemaType = "WebPage" | "AboutPage" | "ContactPage";

export interface RouteSeoConfig {
  path: string;
  title: string;
  pageName: string;
  description: string;
  indexable: boolean;
  imagePath: string;
  imageAlt: string;
  schemaType: SeoSchemaType;
}
