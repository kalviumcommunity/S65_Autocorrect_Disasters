import React from "react";
import { motion } from "framer-motion";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ 
        scale: 1.02
      }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <div className="h-full rounded-lg border border-zinc-800 bg-zinc-900/60 backdrop-blur-md hover:bg-zinc-900/80 transition-all overflow-hidden shadow-md relative">
        <div className="p-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex justify-center mb-6"
          >
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
              {icon}
            </div>
          </motion.div>
          
          <h3 className="text-center font-medium text-lg md:text-xl text-white mb-4">
            {title}
          </h3>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-zinc-400 text-sm md:text-base leading-relaxed text-center"
          >
            {description}
          </motion.p>
        </div>
        
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 opacity-0 z-0 pointer-events-none"
          animate={{ 
            opacity: [0, 0.5, 0],
            rotate: [0, 5]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
    </motion.div>
  );
};

export default FeatureCard;