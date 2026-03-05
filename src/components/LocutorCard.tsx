import { motion } from "framer-motion";

interface LocutorCardProps {
  image: string;
}

const LocutorCard = ({ image }: LocutorCardProps) => {
  return (
    <motion.div
      className="flex items-end justify-center flex-shrink-0 w-[85px]"
      whileHover={{ scale: 1.08, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <img
        src={image}
        className="h-[200px] w-auto object-contain object-bottom"
      />
    </motion.div>
  );
};

export default LocutorCard;