import { motion } from "framer-motion";

interface LocutorCardProps {
  name: string;
  image: string;
  programa?: string;
}

const LocutorCard = ({ name, image, programa }: LocutorCardProps) => {
  return (
    <motion.div
      className="relative group overflow-visible"
      whileHover="hover"
    >
      <div className="aspect-[3/4] overflow-visible flex items-end justify-center">
        <motion.img
          src={image}
          alt={name}
          className="w-full h-[120%] object-contain object-bottom drop-shadow-xl"
          style={{ originY: 1 }}
          variants={{
            hover: { scale: 1.1 },
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </div>
      <div className="text-center mt-2">
        <p className="font-display font-bold text-black text-xs uppercase tracking-tight">{name}</p>
        {programa && (
          <p className="text-black/50 text-[10px] leading-tight px-1">{programa}</p>
        )}
      </div>
    </motion.div>
  );
};

export default LocutorCard;
