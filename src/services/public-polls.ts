import { z } from 'zod';
import { getOrCreateDeviceToken } from './listener-registration/storage';

export const pollSchema = z.object({
  id: z.string().uuid(), slug: z.string(), programId: z.string().uuid(), programName: z.string(),
  question: z.string(), context: z.string(), mode: z.enum(['vote', 'message', 'mixed']),
  imageUrl: z.string().nullish(), identificationPolicy: z.enum(['anonymous', 'optional', 'required']),
  allowMessage: z.boolean(), options: z.array(z.object({id: z.string().uuid(), text: z.string()})),
  startsAt: z.string().datetime({offset:true}), endsAt: z.string().datetime({offset:true}),
});
export type PublicPoll = z.infer<typeof pollSchema>;
export const pollsEnabled = import.meta.env.VITE_ON_AIR_ENABLED === 'true';
const base = (import.meta.env.VITE_PROGRAMMING_API_URL ?? '').replace(/\/$/, '');
export async function pollRequest(path: string, body?: unknown, signal?: AbortSignal) {
  const response = await fetch(`${base}/api/public/polls/${path}`, {
    method: body === undefined ? 'GET' : 'POST', signal,
    headers: body === undefined ? { Accept: 'application/json' } : {
      'Content-Type': 'application/json', 'X-Device-Token': getOrCreateDeviceToken(),
    },
    ...(body !== undefined && {body: JSON.stringify(body)}),
  });
  const value = await response.json().catch(() => null);
  if (!response.ok) throw new PollRequestError(response.status, value?.message ?? 'Não foi possível concluir. Tente novamente.');
  return value;
}
export class PollRequestError extends Error {
  constructor(public status:number, message:string) { super(message); }
}
export async function activePoll(programId: string, signal: AbortSignal) {
  const value = await pollRequest(`active?programId=${encodeURIComponent(programId)}`, undefined, signal);
  return value.poll ? pollSchema.parse(value.poll) : null;
}
