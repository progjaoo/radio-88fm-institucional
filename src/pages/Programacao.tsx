import { useState } from "react";
import { Link } from "react-router-dom";
import { useProgramming, formatMinute } from "@/services/programming/ProgrammingProvider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProgramRail from "@/components/programming/ProgramRail";
import logo from "@/assets/logoheadsvgcolor.svg";
import "@/components/ui/category-tabs.css";

const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function Programacao() {
  const { snapshot, status, enabled, current } = useProgramming();
  const [day, setDay] = useState(1);
  const slots = snapshot?.slots
    .filter(slot => slot.weekday === day)
    .sort((a, b) => a.startMinute - b.startMinute || a.validFrom.localeCompare(b.validFrom)) ?? [];
  const cards = slots.flatMap(slot => {
    const program = snapshot?.programs.find(item => item.id === slot.programId);
    if (!program) return [];
    return [{
      id: slot.id,
      content: <article className="overflow-hidden rounded-xl border bg-white">
        <img src={program.imageUrl ?? logo} alt={program.name} width={1920} height={1080}
          className="aspect-video w-full bg-neutral-50 object-contain" loading="lazy" />
        <div className="p-4 sm:p-5">
          <p className="text-sm font-bold text-radio-blue">
            {formatMinute(slot.startMinute)}–{formatMinute(slot.endMinute)}
            {slot.endMinute < slot.startMinute && " · termina no dia seguinte"}
          </p>
          <h2 className="mt-2 font-display text-lg font-extrabold sm:text-xl">{program.name}</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground sm:text-base">{program.presenters.join(" · ")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{program.description}</p>
          {current?.source === "weekly" && current.sourceId === slot.id && (
            <span className="mt-3 inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">No ar agora</span>
          )}
        </div>
      </article>,
    }];
  });

  return <section className="container max-w-6xl py-10 md:py-16">
    <p className="text-sm font-bold uppercase tracking-widest text-radio-blue">Rádio 88 FM</p>
    <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Nossa programação</h1>
    <Tabs value={String(day)} onValueChange={value => setDay(Number(value))} activationMode="manual" className="mt-7">
      <TabsList aria-label="Dia da semana" className="category-tabs h-auto">
        {days.map((name, index) => <TabsTrigger key={name} value={String(index)} className="category-tab font-body">{name}</TabsTrigger>)}
      </TabsList>
      {days.map((name, index) => <TabsContent key={name} value={String(index)} className="mt-0">
        {index === day && (
          !enabled || status === "unavailable" ? <p role="status">
            Programação temporariamente indisponível. <Link to="/ouvir" className="text-radio-blue underline">Continue ouvindo ao vivo.</Link>
          </p> : status === "loading" ? <p role="status">Carregando programação…</p>
            : cards.length === 0 ? <p>Nenhum programa cadastrado para esse dia.</p>
              : <ProgramRail key={day} day={name} cards={cards} />
        )}
      </TabsContent>)}
    </Tabs>
  </section>;
}
