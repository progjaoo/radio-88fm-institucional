import { motion } from "framer-motion";

interface LocutorCardProps {
  name: string;
  image: string;
  programa?: string;
}

const LocutorCard = ({ name, image, programa }: LocutorCardProps) => {
  return (
    <motion.div
      className="relative group overflow-hidden rounded-lg cursor-pointer bg-radio-dark/50"
      whileHover="hover"
    >
      <div className="aspect-[3/4] overflow-hidden flex items-end justify-center">
        <motion.img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-top"
          variants={{
            hover: { y: -15, scale: 1.08 },
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </div>
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2"
        variants={{
          hover: { y: 0, opacity: 1 },
        }}
        initial={{ y: 10, opacity: 0.7 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <p className="font-display font-bold text-white text-xs">{name}</p>
        {programa && (
          <p className="text-white/70 text-[10px]">{programa}</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LocutorCard;
