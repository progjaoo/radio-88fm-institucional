export type InstitutionalBannerActionType =
  | "none"
  | "external_url"
  | "listener_registration_modal";

export interface PublicInstitutionalBanner {
  id: string;
  title: string;
  altText: string;
  imageUrl: string;
  actionType: InstitutionalBannerActionType;
  destinationUrl: string | null;
  openInNewTab: boolean;
  order: number;
}

export interface PublicInstitutionalBannersResponse {
  version: number;
  items: PublicInstitutionalBanner[];
}
