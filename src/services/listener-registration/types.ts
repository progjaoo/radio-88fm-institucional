export interface ListenerCampaignInactive {
  slug: string;
  active: false;
}

export interface ListenerCampaignActive {
  id: string;
  slug: string;
  type?: "registration" | "sweepstake" | "engagement";
  active: true;
  title: string;
  description: string;
  privacyNoticeVersion: string;
  privacyNoticeUrl: string;
  termsUrl: string | null;
  startsAt: string;
  endsAt: string | null;
}

export type ListenerCampaign = ListenerCampaignInactive | ListenerCampaignActive;

export type ListenerExperience =
  | "anonymous_registration_required"
  | "known_listener_confirmation_required"
  | "already_participating"
  | "campaign_unavailable";

export interface ListenerSession {
  placement: string;
  placementVersion: number;
  campaign: ListenerCampaignActive | null;
  listenerState: "anonymous" | "known";
  experience: ListenerExperience;
  participation: {
    id: string;
    status: string;
    createdAt: string;
  } | null;
  dismissedUntil: string | null;
}

export interface ListenerRegistrationPayload {
  campaignId: string;
  name: string;
  neighborhood: string;
  city: string;
  phone: string;
  submissionToken: string;
  privacyNoticeVersion: string;
  privacyAcknowledged: true;
  marketingOptIn: boolean;
  source: "web";
  website: "";
  utm?: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    content?: string | null;
  };
}

export interface ListenerRegistrationResult {
  id: string;
  status: "created" | "already_processed";
  createdAt: string;
}

export interface ListenerDeviceStateResult {
  dismissedUntil: string | null;
  modalOpenCount: number;
}

export interface ApiFieldError {
  path: string;
  message: string;
}

export class ListenerRegistrationApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly fields: ApiFieldError[] = [],
  ) {
    super(message);
    this.name = "ListenerRegistrationApiError";
  }
}
