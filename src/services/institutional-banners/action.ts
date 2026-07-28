import type { InstitutionalBannerActionType } from "./types";

export function resolvePublicInstitutionalBannerAction(input: {
  actionType?: InstitutionalBannerActionType;
  destinationUrl?: string | null;
}): InstitutionalBannerActionType {
  return input.actionType ?? (input.destinationUrl ? "external_url" : "none");
}
