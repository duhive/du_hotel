import React from 'react';
import { motion } from 'motion/react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  light?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, light = false }) => {
  return (
    <div className="mb-16">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center space-x-4 mb-4"
      >
        <div className={`h-px w-12 ${light ? 'bg-white/30' : 'bg-navy-900/30'}`}></div>
        <span className={`text-xs uppercase tracking-[0.3em] font-semibold ${light ? 'text-silver' : 'text-navy-900/60'}`}>
          {subtitle}
        </span>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className={`text-4xl md:text-5xl font-serif ${light ? 'text-ivory' : 'text-navy-900'}`}
      >
        {title}
      </motion.h2>
    </div>
  );
};

export default SectionHeader;
