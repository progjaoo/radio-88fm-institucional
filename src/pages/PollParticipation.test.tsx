import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PollForm } from './PollParticipation';
import type { PublicPoll } from '@/services/public-polls';
const poll:PublicPoll={id:'11111111-1111-4111-8111-111111111111',programId:'22222222-2222-4222-8222-222222222222',slug:'teste',programName:'Programa',question:'Sua opinião?',context:'Contexto',mode:'mixed',allowMessage:true,identificationPolicy:'optional',options:[{id:'33333333-3333-4333-8333-333333333333',text:'Sim'},{id:'44444444-4444-4444-8444-444444444444',text:'Não'}],startsAt:'2026-11-11T00:00:00Z',endsAt:'2099-11-11T00:00:00Z'};
afterEach(()=>vi.unstubAllGlobals());
beforeEach(()=>vi.stubGlobal('ResizeObserver',class {observe(){} unobserve(){} disconnect(){}}));
function mount(value=poll){return render(<MemoryRouter><PollForm poll={value}/></MemoryRouter>);}
describe('participação pública',()=>{
 it('mostra somente o título e separa a pergunta do formulário em duas colunas responsivas',()=>{
  mount();
  expect(screen.getByRole('heading',{name:'Sua opinião?'})).toBeInTheDocument();
  expect(screen.queryByText('Contexto')).not.toBeInTheDocument();
  expect(screen.getByTestId('poll-layout').className).toContain('lg:grid-cols-2');
  expect(screen.getByRole('region',{name:'Formulário de votação'})).toBeInTheDocument();
 });
 it('não exige alternativa em formato mensagem e não pede cadastro anônimo',async()=>{
  const fetcher=vi.fn().mockResolvedValue({ok:true,json:async()=>({received:true})});vi.stubGlobal('fetch',fetcher);
  mount({...poll,mode:'message',options:[]});
  expect(screen.queryByRole('radiogroup')).toBeNull();
  fireEvent.change(screen.getByLabelText(/Sua opinião/),{target:{value:'Mensagem civil.'}});
  fireEvent.click(screen.getByRole('checkbox',{name:/Li o/}));
  fireEvent.click(screen.getByRole('button',{name:'Enviar participação'}));
  await screen.findByText('Participação recebida');
  expect(fetcher).toHaveBeenCalledTimes(1);
  const body=JSON.parse(fetcher.mock.calls[0][1].body);expect(body.message).toBe('Mensagem civil.');expect(body.optionId).toBeUndefined();expect(body.identified).toBe(false);
 });
 it('reconhece cadastro apenas após ação e confirma sem pedir dados novamente',async()=>{
  const fetcher=vi.fn().mockImplementation(async(url:string)=>({ok:true,json:async()=>url.endsWith('/identity')?{known:true,displayName:'Teste',neighborhood:'Centro'}:{received:true}}));vi.stubGlobal('fetch',fetcher);
  mount();expect(fetcher).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('checkbox',{name:/Quero me identificar/}));
  fireEvent.click(screen.getByRole('button',{name:/Já tenho cadastro/}));
  await screen.findByText(/Você já tem um cadastro conosco/);
  expect(screen.queryByLabelText('Telefone')).toBeNull();
  fireEvent.click(screen.getByLabelText('Sim'));
  fireEvent.click(screen.getByRole('checkbox',{name:/Li o/}));
  fireEvent.click(screen.getByRole('button',{name:'Enviar participação'}));
  await screen.findByText('Participação recebida');expect(fetcher).toHaveBeenCalledTimes(2);
 });
 it('preserva o recibo em retry de falha de rede sem duplicar a intenção',async()=>{
  const fetcher=vi.fn().mockRejectedValueOnce(new Error('Sem conexão')).mockResolvedValue({ok:true,json:async()=>({received:true})});vi.stubGlobal('fetch',fetcher);
  mount({...poll,mode:'message',options:[]});
  fireEvent.change(screen.getByLabelText(/Sua opinião/),{target:{value:'Minha opinião'}});fireEvent.click(screen.getByRole('checkbox',{name:/Li o/}));
  fireEvent.click(screen.getByRole('button',{name:'Enviar participação'}));await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button',{name:/Tentar novamente/}));await screen.findByText('Participação recebida');
  expect(fetcher.mock.calls[0][1].body).toBe(fetcher.mock.calls[1][1].body);
  await waitFor(()=>expect(screen.queryByRole('textbox')).toBeNull());
 });
});
