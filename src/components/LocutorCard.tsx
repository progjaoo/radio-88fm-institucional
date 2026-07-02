import { motion } from "framer-motion";

interface LocutorCardProps {
  image: string;
}

const LocutorCard = ({ image }: LocutorCardProps) => {
  return (
<motion.div
      className="flex items-end justify-center flex-shrink-0 w-[113px] cursor-pointer"
      // Adicionamos o 'y' negativo para subir o card
      whileHover={{ 
        scale: 1.40, 
        y: -20, // Move 20px para cima
        zIndex: 10 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <img
        src={image}
        className="h-[250px] w-auto object-contain object-bottom"
        alt="Locutor"
      />
    </motion.div>
  );
};

export default LocutorCard;
