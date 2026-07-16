import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LocutorCardProps {
  image: string;
  name: string;
  program: string;
}

const LocutorCard = ({ image, name, program }: LocutorCardProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className="flex w-[113px] flex-shrink-0 cursor-pointer items-end justify-center outline-none focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-radio-blue focus-visible:ring-offset-2"
          role="group"
          tabIndex={0}
          aria-label={`${name} - ${program}`}
          whileHover={{
            scale: 1.4,
            y: -40,
            zIndex: 4,
          }}
          whileFocus={{
            scale: 1.18,
            y: -4,
            zIndex: 4,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <img
            src={image}
            className="h-[250px] w-auto object-contain object-bottom"
            alt={name}
          />
        </motion.div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={-150}
        className="border-white/10 bg-black px-4 py-3 text-center text-white shadow-xl"
      >
        <p className="font-display text-sm font-extrabold leading-none">{name}</p>
        <p className="mt-1 text-xs font-semibold text-white/70">{program}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default LocutorCard;
