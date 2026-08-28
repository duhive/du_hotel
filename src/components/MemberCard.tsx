import React from 'react';
import { motion } from 'motion/react';
import { Mail, ChevronRight } from 'lucide-react';
import { Member } from '../types';

interface MemberCardProps {
  member: Member;
  onClick: () => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-lg bg-navy-900/10"
      onClick={onClick}
    >
      {/* Placeholder Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900/20 to-navy-900/30"></div>
      
      {/* Bottom Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
      
      <div className="absolute bottom-0 left-0 p-6 w-full">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1">
          {member.role}
        </p>
        <h3 className="text-2xl font-bold text-white tracking-tight">
          {member.name}
        </h3>
      </div>
    </motion.div>
  );
};

export default MemberCard;
