import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {programmingSnapshotSchema,type ProgrammingSnapshot} from './programming-contract';
import {resolveOnAir} from './programming-resolver';
export const programmingEnabled=import.meta.env.VITE_ON_AIR_ENABLED==='true';
const apiBase=(import.meta.env.VITE_PROGRAMMING_API_URL??'').replace(/\/$/,'');
export const formatMinute=(n:number)=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
export function currentProgramming(snapshot:ProgrammingSnapshot|null,now:number){
 if(!snapshot||Date.parse(snapshot.validUntil)<=now)return null;
 try{
  const match=resolveOnAir({at:new Date(now),radioKey:snapshot.radioKey,slots:snapshot.slots.map(s=>({...s,validUntil:s.validUntil??null,radioKey:snapshot.radioKey,active:true,programActive:true})),exceptions:snapshot.exceptions.map(e=>({...e,programId:e.programId??null,radioKey:snapshot.radioKey,active:true,programActive:true}))});
  if(!match)return null;
  const program=snapshot.programs.find(p=>p.id===match.programId);if(!program)return null;
  const slot=snapshot.slots.find(s=>s.id===match.sourceId),exception=snapshot.exceptions.find(e=>e.id===match.sourceId);
  const time=slot?`${formatMinute(slot.startMinute)} às ${formatMinute(slot.endMinute)}`:exception?`${new Date(exception.startsAt).toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'})} às ${new Date(exception.endsAt).toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'})}`:'';
  return {...program,time,source:match.source,sourceId:match.sourceId};
 }catch{return null;}
}
interface ProgrammingContextValue {enabled:boolean;snapshot:ProgrammingSnapshot|null;current:ReturnType<typeof currentProgramming>;status:'loading'|'ready'|'unavailable'}
const ProgrammingContext=createContext<ProgrammingContextValue>({enabled:false,snapshot:null,current:null,status:'unavailable'});
export function ProgrammingProvider({children}:{children:ReactNode}){
 const [snapshot,setSnapshot]=useState<ProgrammingSnapshot|null>(null),[now,setNow]=useState(0),[status,setStatus]=useState<ProgrammingContextValue['status']>('loading');
 useEffect(()=>{
  if(!programmingEnabled)return;
  let cancelled=false,timer:ReturnType<typeof setTimeout>|undefined,controller:AbortController|undefined;
  const refresh=async()=>{
   if(document.hidden||cancelled)return;
   controller?.abort();controller=new AbortController();
   try{
    const response=await fetch(`${apiBase}/api/public/programming/config`,{signal:controller.signal});
    if(!response.ok)throw new Error('Snapshot unavailable');
    const value=programmingSnapshotSchema.parse(await response.json());
    if(Date.parse(value.validUntil)<=Date.now())throw new Error('Snapshot expired');
    if(!cancelled){setSnapshot(value);setNow(Date.now());setStatus('ready');}
   }catch(error){if(!cancelled&&!(error instanceof Error&&error.name==='AbortError')){setStatus('unavailable');setSnapshot(null);}}
   finally{if(!cancelled&&!document.hidden)timer=setTimeout(()=>void refresh(),60_000);}
  };
  const visibility=()=>{clearTimeout(timer);if(document.hidden)controller?.abort();else{setNow(Date.now());void refresh();}};
  void refresh();document.addEventListener('visibilitychange',visibility);
  return()=>{cancelled=true;controller?.abort();clearTimeout(timer);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 useEffect(()=>{
  if(!programmingEnabled||!snapshot)return;
  let timer:ReturnType<typeof setTimeout>;
  const tick=()=>{
   clearTimeout(timer);if(document.hidden)return;
   const time=Date.now();setNow(time);
   const next=Math.min(time+60_000-time%60_000,Date.parse(snapshot.validUntil),...snapshot.exceptions.flatMap(e=>[Date.parse(e.startsAt),Date.parse(e.endsAt)]).filter(t=>t>time));
   if(next>time)timer=setTimeout(tick,next-time+25);
  };
  tick();document.addEventListener('visibilitychange',tick);
  return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',tick);};
 },[snapshot]);
 const value=useMemo<ProgrammingContextValue>(()=>{const expired=!!snapshot&&Date.parse(snapshot.validUntil)<=now;return {enabled:programmingEnabled,snapshot:expired?null:snapshot,current:currentProgramming(snapshot,now),status:expired?'unavailable':status};},[snapshot,now,status]);
 return <ProgrammingContext.Provider value={value}>{children}</ProgrammingContext.Provider>;
}
export const useProgramming=()=>useContext(ProgrammingContext);
