import {Link} from 'react-router-dom';
import {useEffect,useState,type CSSProperties} from 'react';
import {activePoll,type PublicPoll} from '@/services/public-polls';
import {Play,CalendarDays} from 'lucide-react';
import {useProgramming} from '@/services/programming/ProgrammingProvider';
import logo from '@/assets/logoheadsvgcolor.svg';
import './OnAirSection.css';

const existingArtworkColors: Record<string, string> = {
 '35ef3fa5-ffef-47f7-b12a-28e514ee34f3.webp': '#D26F01',
 '4a66e70a-a51b-435e-9616-6b9639daf8e8.webp': '#FFB904',
 '6082a498-6460-4b45-9353-00c73a470eb0.webp': '#E73C24',
 '736d5e43-98d9-4e66-b73f-2a274da632a5.webp': '#FFB900',
 'a2101807-e2ac-46c9-9efb-628b7e069471.webp': '#122C53',
};
export default function OnAirSection(){
 const {enabled,current,status}=useProgramming();
 const [failedImage,setFailedImage]=useState<string|null>(null);
 const [poll,setPoll]=useState<PublicPoll|null>(null);
 useEffect(()=>{
  setPoll(null);if(!enabled||!current?.id)return;
  let mounted=true;let request:AbortController|undefined;
  const refresh=()=>{
   request?.abort();const controller=new AbortController();request=controller;
   activePoll(current.id,controller.signal).then(value=>{
    if(!mounted||controller.signal.aborted)return;
    setPoll(value&&Date.parse(value.startsAt)<=Date.now()&&Date.parse(value.endsAt)>Date.now()?value:null);
   }).catch(()=>{});
  };
  refresh();const timer=window.setInterval(refresh,15_000);
  return()=>{mounted=false;window.clearInterval(timer);request?.abort();};
 },[enabled,current?.id]);
 if(!enabled)return null;
 const image=current?.imageUrl;
 const imageKey=image ? current.id + ':' + image : null;
 const hasArt=Boolean(imageKey && imageKey!==failedImage);
 const color=hasArt ? current?.imageEdgeColor ?? existingArtworkColors[new URL(image!).pathname.split('/').pop() ?? ''] : undefined;
 const style=color ? {'--program-edge':color} as CSSProperties : undefined;
 const active=poll;
 return <section aria-label="Programa no ar" className="mx-auto my-10 w-full max-w-[1500px] px-4 sm:px-6 lg:px-10 xl:px-12">
 <div className="on-air-card" style={style} data-art={hasArt}>
 <div className="on-air-media">{hasArt?<img key={imageKey} src={image!} alt={current!.name} loading="lazy" onError={()=>setFailedImage(imageKey)}/>:<img src={logo} alt="Rádio 88 FM" />}</div>
 <div className="on-air-content flex min-w-0 flex-col justify-center p-4 sm:p-6">
 <div className="on-air-details">
 <div className="on-air-identity">
 <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-radio-blue">{current?'No Ar · Rádio 88 FM':'Rádio 88 FM ao vivo'}</p>
 <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-black md:text-3xl">{current?.name??(status==='loading'?'Carregando programação…':'A rádio que toca o som do céu')}</h2>
 </div>
 {current&&<div className="on-air-schedule">
 <p className="on-air-time"><CalendarDays size={15} aria-hidden="true"/><span>{current.time}</span></p>
 {current.presenters.length>0&&<p className="on-air-presenters">{current.presenters.join(' · ')}</p>}
 </div>}
 </div>
 {current?.description&&<p className="mt-3 text-muted-foreground">{current.description}</p>}
 <div className="on-air-actions flex flex-wrap justify-center gap-3"><Link to={active?`/enquetes/${active.slug}`:'/ouvir'} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-display font-bold text-white"><Play size={17} fill="currentColor"/>{active?'PARTICIPE DO PROGRAMA':'OUVIR AO VIVO'}</Link><Link to="/programacao" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-radio-blue px-5 py-3 font-display font-bold text-white"><CalendarDays size={17}/>Ver programação</Link></div></div></div></section>;
}
