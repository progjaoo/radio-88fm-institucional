import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LocutorCardProps {
  image: string;
  name: string;
  program: string;
  compact?: boolean;
}

const LocutorCard = ({ image, name, program, compact = false }: LocutorCardProps) => {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className={`${compact ? "relative min-w-0 flex-1" : "w-[113px] flex-shrink-0"} flex cursor-pointer items-end justify-center outline-none focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-radio-blue focus-visible:ring-offset-2`}
          role="group"
          tabIndex={0}
          aria-label={`${name} - ${program}`}
          whileHover={{
            scale: reducedMotion ? 1 : 1.4,
            y: reducedMotion ? 0 : -40,
            zIndex: 4,
          }}
          whileFocus={{
            scale: reducedMotion ? 1 : 1.18,
            y: reducedMotion ? 0 : -4,
            zIndex: 4,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <img
            src={image}
            className={compact ? "h-[clamp(5rem,12vw,9rem)] w-[150%] max-w-none shrink-0 object-contain object-bottom" : "h-[250px] w-auto object-contain object-bottom"}
            alt={name}
          />
        </motion.div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={compact ? 8 : -150}
        className="border-white/10 bg-black px-4 py-3 text-center text-white shadow-xl"
      >
        <p className="font-display text-sm font-extrabold leading-none">{name}</p>
        <p className="mt-1 text-xs font-semibold text-white/70">{program}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default LocutorCard;
