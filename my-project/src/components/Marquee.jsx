import React from 'react';
import { motion } from 'framer-motion';

const Marquee = ({ text, reverse = false, className = "" }) => {
  return (
    <div className={`overflow-hidden whitespace-nowrap bg-orange-600 text-white py-2 ${className}`}>
      <motion.div
        initial={{ x: reverse ? "-100%" : "0%" }}
        animate={{ x: reverse ? "0%" : "-100%" }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}

        className="inline-block"
      >
        <span className="text-sm font-bold uppercase tracking-widest px-4">{text} • {text} • {text} • {text} • {text} • {text} • {text} • {text}</span>
      </motion.div>
      <motion.div
        initial={{ x: reverse ? "-100%" : "0%" }}
        animate={{ x: reverse ? "0%" : "-100%" }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}

        className="inline-block"
      >
        <span className="text-sm font-bold uppercase tracking-widest px-4">{text} • {text} • {text} • {text} • {text} • {text} • {text} • {text}</span>
      </motion.div>
    </div>
  );
};

export default Marquee;
