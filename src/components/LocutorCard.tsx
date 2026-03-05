import { motion } from "framer-motion";

interface LocutorCardProps {
  name: string;
  image: string;
  programa?: string;
}

const LocutorCard = ({ name, image, programa }: LocutorCardProps) => {
  return (
    <motion.div
      className="relative group overflow-hidden rounded-lg cursor-pointer"
      whileHover="hover"
    >
      <div className="aspect-[3/4] overflow-hidden">
        <motion.img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          variants={{
            hover: { y: -20, scale: 1.05 },
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </div>
      <motion.div
        className="absolute bottom-0 left-0 right-0 radio-gradient p-3"
        variants={{
          hover: { y: 0, opacity: 1 },
        }}
        initial={{ y: 20, opacity: 0.8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <p className="font-display font-bold text-primary-foreground text-sm">{name}</p>
        {programa && (
          <p className="text-primary-foreground/80 text-xs">{programa}</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LocutorCard;
