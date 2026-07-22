import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Radio, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useListenerRegistrationCampaign } from "@/hooks/useListenerRegistrationCampaign";
import { Analytics } from "@/services/analytics/analytics";
import {
  createListenerRegistration,
  participateKnownListener,
} from "@/services/listener-registration/api";
import {
  getOrCreateSubmissionToken,
  markListenerRegistrationCompleted,
} from "@/services/listener-registration/storage";
import { ListenerRegistrationApiError } from "@/services/listener-registration/types";
import type { ListenerCampaignActive } from "@/services/listener-registration/types";
import { useMutation } from "@tanstack/react-query";

const listenerRegistrationSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(160, "Use ate 160 caracteres."),
  neighborhood: z.string().trim().min(2, "Informe seu bairro.").max(120, "Use ate 120 caracteres."),
  city: z.string().trim().min(2, "Informe sua cidade.").max(120, "Use ate 120 caracteres."),
  phone: z.string().trim().min(8, "Informe seu telefone.").max(30, "Use ate 30 caracteres."),
  privacyAcknowledged: z.boolean().refine((value) => value === true, "Confirme o aviso de privacidade para continuar."),
  marketingOptIn: z.boolean().default(false),
  website: z.string().max(0).optional(),
});

type ListenerRegistrationFormValues = z.infer<typeof listenerRegistrationSchema>;

const defaultValues: ListenerRegistrationFormValues = {
  name: "",
  neighborhood: "",
  city: "",
  phone: "",
  privacyAcknowledged: false,
  marketingOptIn: false,
  website: "",
};

function getUtmParams() {
  if (typeof window === "undefined") return undefined;

  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    content: params.get("utm_content"),
  };
}

function getSubmissionSource(): "institutional_web" | "institutional_mobile" {
  if (typeof window === "undefined") return "institutional_web";
  return window.matchMedia("(max-width: 767px)").matches ? "institutional_mobile" : "institutional_web";
}

function getPrivacyPath(campaign: ListenerCampaignActive) {
  return campaign.privacyNoticeUrl.startsWith("/") ? campaign.privacyNoticeUrl : "/privacidade";
}

function getErrorMessage(error: unknown) {
  if (error instanceof ListenerRegistrationApiError) {
    if (error.code === "RATE_LIMIT_EXCEEDED") {
      return "Muitas tentativas. Aguarde um pouco antes de tentar novamente.";
    }
    if (error.code === "CAMPAIGN_CLOSED" || error.code === "CAMPAIGN_UNAVAILABLE") {
      return "Este cadastro nao esta disponivel no momento.";
    }
    if (error.code === "PRIVACY_NOTICE_VERSION_MISMATCH") {
      return "O aviso de privacidade foi atualizado. Feche e abra o site novamente antes de continuar.";
    }
    return error.message;
  }

  return "Nao foi possivel enviar agora. Verifique sua conexao e tente novamente.";
}

export default function ListenerRegistrationModal() {
  const { campaign, deviceToken, experience, open, setOpen, dismiss } =
    useListenerRegistrationCampaign();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ListenerRegistrationFormValues>({
    resolver: zodResolver(listenerRegistrationSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const privacyPath = useMemo(() => (campaign ? getPrivacyPath(campaign) : "/privacidade"), [campaign]);

  const mutation = useMutation({
    mutationFn: async (values: ListenerRegistrationFormValues) => {
      if (!campaign) throw new Error("Campanha indisponivel.");

      return createListenerRegistration({
        campaignId: campaign.id,
        name: values.name,
        neighborhood: values.neighborhood,
        city: values.city,
        phone: values.phone.trim(),
        submissionToken: getOrCreateSubmissionToken(campaign.slug),
        privacyNoticeVersion: campaign.privacyNoticeVersion,
        privacyAcknowledged: true,
        marketingOptIn: values.marketingOptIn,
        source: "web",
        website: "",
        utm: getUtmParams(),
      }, deviceToken);
    },
    retry: false,
    onSuccess: (_result, values) => {
      Analytics.track("listener_registration_success", {
        campaign_slug: campaign?.slug,
        source: getSubmissionSource(),
        has_phone: Boolean(values.phone?.trim()),
        marketing_opt_in: values.marketingOptIn,
      });
      if (campaign) {
        markListenerRegistrationCompleted(campaign.slug);
      }
      setSubmitted(true);
    },
    onError: (error) => {
      Analytics.track("listener_registration_error", {
        campaign_slug: campaign?.slug,
        code: error instanceof ListenerRegistrationApiError ? error.code : "CLIENT_ERROR",
      });
    },
  });

  const knownParticipationMutation = useMutation({
    mutationFn: async () => {
      if (!campaign) throw new Error("Campanha indisponivel.");
      return participateKnownListener(campaign.id, deviceToken);
    },
    retry: false,
    onSuccess: () => {
      Analytics.track("listener_registration_known_participation_success", {
        campaign_slug: campaign?.slug,
      });
      if (campaign) {
        markListenerRegistrationCompleted(campaign.slug);
      }
      setSubmitted(true);
    },
    onError: (error) => {
      Analytics.track("listener_registration_error", {
        campaign_slug: campaign?.slug,
        code: error instanceof ListenerRegistrationApiError ? error.code : "CLIENT_ERROR",
      });
    },
  });

  useEffect(() => {
    if (open && campaign) {
      Analytics.track("listener_registration_modal_open", {
        campaign_slug: campaign.slug,
      });
    }
  }, [campaign, open]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !submitted) {
      Analytics.track("listener_registration_dismiss", {
        campaign_slug: campaign?.slug,
        method: "dialog_close",
      });
      dismiss();
      return;
    }

    setOpen(nextOpen);
  }

  function handleDismissButton() {
    Analytics.track("listener_registration_dismiss", {
      campaign_slug: campaign?.slug,
      method: "button",
    });
    dismiss();
  }

  async function onSubmit(values: ListenerRegistrationFormValues) {
    Analytics.track("listener_registration_submit", {
      campaign_slug: campaign?.slug,
      has_phone: Boolean(values.phone?.trim()),
      marketing_opt_in: values.marketingOptIn,
    });
    await mutation.mutateAsync(values);
  }

  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="
    max-h-[92svh]
    overflow-y-auto
    border-0
    p-0
    sm:max-w-[560px]
    sm:rounded-[24px]
    [&>button]:absolute
    [&>button]:top-4
    [&>button]:right-4
    [&>button]:z-50
    [&>button]:flex
    [&>button]:items-center
    [&>button]:justify-center
    [&>button]:h-10
    [&>button]:w-10
    [&>button]:rounded-full
    [&>button]:p-0
    [&>button]:bg-white/20
    [&>button]:text-white
    [&>button]:opacity-100
    [&>button]:transition-all
    [&>button:hover]:bg-red-600
    [&>button:hover]:scale-110
    [&>button>svg]:h-5
    [&>button>svg]:w-5
    [&>button>svg]:shrink-0
  ">
        <div className="bg-radio-brand-blue px-6 py-7 text-white sm:px-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Radio className="h-6 w-6" aria-hidden="true" />
          </div>
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
              {campaign.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-white/82">
              {campaign.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {submitted ? (
          <div className="space-y-5 px-6 py-7 sm:px-8">
            <div className="flex items-start gap-3 rounded-2xl border border-radio-blue/20 bg-radio-blue/5 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-radio-blue" aria-hidden="true" />
              <div>
                <h3 className="font-display text-lg font-extrabold text-radio-dark">Cadastro recebido</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Seus dados foram enviados para a equipe da Rádio 88 FM.
                </p>
              </div>
            </div>
            <Button className="h-12 w-full rounded-full bg-radio-red font-display font-extrabold hover:bg-radio-red/90" onClick={() => setOpen(false)}>
              Continuar no site
            </Button>
          </div>
        ) : experience === "known_listener_confirmation_required" ? (
          <div className="space-y-5 px-6 py-7 sm:px-8">
            <div className="rounded-2xl bg-muted/55 p-4">
              <h3 className="font-display text-lg font-extrabold text-radio-dark">
                Voce ja tem cadastro
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Deseja participar deste sorteio com o cadastro que ja esta salvo neste dispositivo?
              </p>
            </div>

            {knownParticipationMutation.error && (
              <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p>{getErrorMessage(knownParticipationMutation.error)}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                className="h-12 flex-1 rounded-full bg-radio-red font-display font-extrabold hover:bg-radio-red/90"
                disabled={knownParticipationMutation.isPending}
                onClick={() => knownParticipationMutation.mutate()}
              >
                {knownParticipationMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Sim, quero participar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-full px-6 font-display font-extrabold"
                onClick={handleDismissButton}
                disabled={knownParticipationMutation.isPending}
              >
                Agora nao
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form className="space-y-5 px-6 py-7 sm:px-8" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input autoComplete="name" placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input autoComplete="address-level3" placeholder="Seu bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input autoComplete="address-level2" placeholder="Sua cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input inputMode="tel" autoComplete="tel" placeholder="(24) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="hidden" aria-hidden="true">
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input tabIndex={-1} autoComplete="off" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-3 rounded-2xl bg-muted/55 p-4">
                <FormField
                  control={form.control}
                  name="privacyAcknowledged"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <div className="flex items-start gap-3">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="text-sm font-normal leading-5">
                          Li e aceito o{" "}
                          <Link className="font-semibold text-radio-blue underline-offset-4 hover:underline" to={privacyPath} target="_blank">
                            aviso de privacidade
                          </Link>
                          .
                        </FormLabel>
                      </div>
                      <FormMessage className="pl-7" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marketingOptIn"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <div className="flex items-start gap-3">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="text-sm font-normal leading-5">
                          Quero receber novidades e avisos da Rádio 88 FM.
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {mutation.error && (
                <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <p>{getErrorMessage(mutation.error)}</p>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  className="h-12 flex-1 rounded-full bg-radio-red font-display font-extrabold hover:bg-radio-red/90"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  Cadastrar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-full px-6 font-display font-extrabold"
                  onClick={handleDismissButton}
                  disabled={mutation.isPending}
                >
                  Agora nao
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
