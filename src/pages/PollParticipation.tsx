import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { pollsEnabled, pollRequest, pollSchema, PollRequestError, type PublicPoll } from '@/services/public-polls';

export default function PollParticipation() {
  const { slug } = useParams();
  const [poll, setPoll] = useState<PublicPoll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!pollsEnabled || !slug) { setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true); setPoll(null); setError('');
    pollRequest(encodeURIComponent(slug), undefined, controller.signal)
      .then(value => { if (!controller.signal.aborted) setPoll(pollSchema.parse(value)); })
      .catch(e => { if (!controller.signal.aborted) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [slug]);
  return <section aria-label="Participação no programa" className="container max-w-6xl py-10 md:py-16">
    <Helmet><title>Participe do programa | Rádio 88 FM</title><meta name="robots" content="noindex,follow" /></Helmet>
    <Link to="/" className="font-semibold text-radio-blue">Voltar à rádio</Link>
    {loading ? <p role="status" className="py-10">Carregando enquete…</p> : poll ? <PollForm key={poll.id} poll={poll} /> :
      <div role="alert" className="py-10"><h1 className="font-display text-3xl font-bold">Enquete indisponível</h1><p className="mt-3">{error || 'Não há uma enquete disponível neste momento.'}</p></div>}
  </section>;
}

export function PollForm({poll}: {poll: PublicPoll}) {
  const [optionId, setOptionId] = useState(''), [message, setMessage] = useState('');
  const [identify, setIdentify] = useState(poll.identificationPolicy === 'required');
  const [identity, setIdentity] = useState<{known: boolean; displayName?: string; neighborhood?: string} | null>(null);
  const [profile, setProfile] = useState({name: '', neighborhood: '', city: '', phone: ''});
  const [privacy, setPrivacy] = useState(false), [busy, setBusy] = useState(false), [done, setDone] = useState(false);
  const [error, setError] = useState('');
  // Keep an uncertain submission unchanged for a safe retry. No personal data is persisted in the browser.
  const pending = useRef<Record<string, unknown> | null>(null);
  const hasVote = poll.mode !== 'message', hasMessage = poll.mode !== 'vote';
  async function recognize() {
    setBusy(true); setError('');
    try { setIdentity(await pollRequest(`${poll.id}/identity`, {})); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível reconhecer o cadastro.'); }
    finally { setBusy(false); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy || done) return;
    setError('');
    if (hasVote && !optionId) { setError('Escolha uma alternativa.'); return; }
    if (poll.mode === 'message' && !message.trim()) { setError('Escreva sua participação.'); return; }
    if (!privacy) { setError('Confirme a leitura do aviso de privacidade.'); return; }
    setBusy(true);
    try {
      if (identify && !identity?.known) {
        const saved = await pollRequest(`${poll.id}/identity`, {...profile, privacyAccepted: true});
        setIdentity(saved);
      }
      pending.current ??= {submissionId: crypto.randomUUID(), ...(hasVote && {optionId}),
        ...(hasMessage && message.trim() && {message: message.trim()}), identified: identify, privacyAccepted: true};
      await pollRequest(`${poll.id}/submit`, pending.current);
      setDone(true); setMessage(''); setProfile({name: '', neighborhood: '', city: '', phone: ''});
      toast.success('Sua participação foi recebida!');
    } catch (e) {
      if(e instanceof PollRequestError && [400,422].includes(e.status)) pending.current=null;
      setError(e instanceof Error ? e.message : 'Não foi possível enviar.');
    }
    finally { setBusy(false); }
  }
  return <div data-testid="poll-layout" className="mt-8 grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
    <div className="min-w-0">
      <header className="rounded-2xl bg-blue-50 p-6 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-widest text-radio-blue">{poll.programName} · Participe</p>
        <h1 className="mt-4 font-display text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">{poll.question}</h1>
        <p className="mt-5 text-sm text-muted-foreground">Disponível até {new Date(poll.endsAt).toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'})} (Brasília).</p>
      </header>
      {poll.imageUrl && <img src={poll.imageUrl} alt="Arte da enquete" className="mt-5 max-h-[560px] w-full rounded-2xl object-contain" />}
    </div>
    <section aria-label="Formulário de votação" className="min-w-0 rounded-2xl border border-radio-blue/20 bg-white p-5 sm:p-8">
      {done ? <div role="status" className="py-3"><h2 className="text-xl font-bold">Participação recebida</h2><p className="mt-2">Obrigado por participar! Sua mensagem é privada para a equipe do programa.</p><Button asChild className="mt-5"><Link to="/">Voltar ao início</Link></Button></div> :
      <form onSubmit={submit} className="flex flex-col gap-6">
        <fieldset disabled={busy || !!pending.current} className="flex flex-col gap-6">
        {hasVote && <div><h2 className="mb-3 font-semibold" id="poll-options">Escolha sua resposta</h2><RadioGroup aria-labelledby="poll-options" value={optionId} onValueChange={setOptionId}>
          {poll.options.map(o => <label key={o.id} htmlFor={o.id} className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 has-[:checked]:border-radio-blue"><RadioGroupItem id={o.id} value={o.id} />{o.text}</label>)}
        </RadioGroup></div>}
        {hasMessage && <label className="flex flex-col gap-2 font-semibold">Sua opinião {poll.mode === 'mixed' && '(opcional)'}<Textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={4000} required={poll.mode === 'message'} rows={5} placeholder="Compartilhe sua opinião com respeito." /><span className="text-xs font-normal text-muted-foreground">Privada para a equipe. Não é publicada automaticamente. Até 4.000 caracteres.</span></label>}
        {poll.identificationPolicy !== 'anonymous' && <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2"><input type="checkbox" checked={identify} disabled={poll.identificationPolicy === 'required'} onChange={e => {setIdentify(e.target.checked); setIdentity(null);}} />Quero me identificar {poll.identificationPolicy === 'optional' && '(opcional)'}</label>
          {identify && <><Button type="button" variant="outline" onClick={recognize}>Já tenho cadastro neste dispositivo</Button>
          {identity?.known ? <p className="rounded-lg bg-blue-50 p-4">Você já tem um cadastro conosco, {identity.displayName}. Confirme abaixo para participar.</p> : <div className="grid gap-4 sm:grid-cols-2">{(['name','neighborhood','city','phone'] as const).map((key,i) => <label key={key} className="flex flex-col gap-2 text-sm font-semibold">{['Nome','Bairro','Cidade','Telefone'][i]}<Input required value={profile[key]} maxLength={key === 'phone' ? 20 : 120} type={key === 'phone' ? 'tel' : 'text'} autoComplete={key === 'name' ? 'name' : key === 'phone' ? 'tel' : 'off'} onChange={e=>setProfile({...profile,[key]:e.target.value})} /></label>)}</div>}</>}
        </div>}
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={privacy} onChange={e=>setPrivacy(e.target.checked)} required /><span>Li o <Link to="/privacidade" target="_blank" rel="noopener noreferrer" className="underline">aviso de privacidade</Link> e confirmo o envio para esta enquete. Isso não autoriza mensagens de marketing.</span></label>
        </fieldset>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">{error}</p>}
        <Button type="submit" disabled={busy} className="min-h-12 bg-radio-blue text-white hover:bg-radio-blue/90">{busy ? 'Enviando…' : pending.current ? 'Tentar novamente o mesmo envio' : 'Enviar participação'}</Button>
      </form>}
    </section>
  </div>;
}
