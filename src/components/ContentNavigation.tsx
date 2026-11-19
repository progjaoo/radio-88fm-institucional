import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, MessageCircle, Mic, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink,
  NavigationMenuList, NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { contentCategories, contentPath } from "@/services/video-contents";

const icons = {
  "debate-88": Mic,
  "altar-88": BookOpen,
  "encerramento-enquete-88": MessageCircle,
  "cristo-em-nos": Users,
};

type Props = { onSelect: (destination: string) => void };

function useContentDestination() {
  const location = useLocation();
  return (category: string) => {
    if (location.pathname !== "/conteudos") return contentPath(category);
    const params = new URLSearchParams(location.search);
    params.set("categoria", category);
    return "/conteudos?" + params.toString();
  };
}

export function DesktopContentsMenu({ onSelect }: Props) {
  const [open, setOpen] = useState("");
  const active = useLocation().pathname === "/conteudos";
  const destination = useContentDestination();
  return (
    <NavigationMenu aria-label="Programas em Conteúdos" className="flex-none [&>div]:left-1/2 [&>div]:-translate-x-1/2" delayDuration={150} value={open} onValueChange={setOpen}>
      <NavigationMenuList>
        <NavigationMenuItem value="conteudos">
          <NavigationMenuTrigger className={cn(
            "bg-transparent px-0 font-display text-xs font-semibold tracking-wide hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary data-[state=open]:bg-transparent data-[state=open]:text-primary min-[1400px]:text-sm",
            active ? "text-primary" : "text-white",
          )}>CONTEÚDOS</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[336px] p-2">
              <p className="px-3 pb-2 pt-2.5 text-xs font-bold tracking-wide text-muted-foreground">ESCOLHA O SEU PROGRAMA</p>
              {contentCategories.map(({ id, name, description }) => {
                const Icon = icons[id];
                return (
                  <NavigationMenuLink asChild key={id}>
                    <Link to={destination(id)} onClick={() => { setOpen(""); onSelect(name); }}
                      className="grid min-h-14 grid-cols-[36px_minmax(0,1fr)_16px] items-center gap-3 rounded-md px-3 py-2 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
                      <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-radio-blue-dark"><Icon className="size-[18px]" aria-hidden="true" /></span>
                      <span>
                        <strong className="block font-display text-[.8125rem] leading-snug">{name}</strong>
                        <small className="mt-0.5 block text-xs text-muted-foreground">{description}</small>
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </NavigationMenuLink>
                );
              })}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function MobileContentsMenu({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const destination = useContentDestination();
  return (
    <>
      <button type="button" className="flex min-h-11 items-center justify-between gap-2 text-left font-display text-sm font-semibold text-primary"
        aria-expanded={open} aria-controls="mobile-content-links" onClick={() => setOpen(!open)}>
        CONTEÚDOS <ChevronDown className={cn("size-4", open && "rotate-180")} aria-hidden="true" />
      </button>
      <div id="mobile-content-links" hidden={!open} className="border-l border-white/25 pl-3">
        {contentCategories.map(({ id, name, description }) => {
          const Icon = icons[id];
          return (
            <Link key={id} to={destination(id)} onClick={() => onSelect(name)} className="flex min-h-11 items-center gap-2 py-1 text-sm text-white">
              <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{name}<small className="block text-xs text-white/75">{description}</small></span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
