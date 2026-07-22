export interface PublicInstitutionalBanner {
  id: string;
  title: string;
  altText: string;
  imageUrl: string;
  destinationUrl: string | null;
  openInNewTab: boolean;
  order: number;
}

export interface PublicInstitutionalBannersResponse {
  version: number;
  items: PublicInstitutionalBanner[];
}
