import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, GraduationCap, Medal } from 'lucide-react';
import { Member } from '../types';

interface MemberModalProps {
  member: Member | null;
  onClose: () => void;
}

const MemberModal: React.FC<MemberModalProps> = ({ member, onClose }) => {
  if (!member) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500 hover:text-hive-green transition-all z-20"
          >
            <X size={20} />
          </button>

          {/* Left Side: Image Placeholder */}
          <div className="w-full md:w-1/2 relative bg-gray-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400"></div>
            {/* Subtle Gradient Overlay like the image */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
            <div className="mb-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-hive-green mb-2">
                {member.role}
              </p>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                {member.name}
              </h2>
            </div>

            <div className="space-y-8">
              {/* Education Section */}
              <div>
                <div className="flex items-center space-x-2 text-gray-400 mb-3">
                  <GraduationCap size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Education</span>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  대구대학교 {member.department}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Interests Section */}
                <div>
                  <div className="flex items-center space-x-2 text-gray-400 mb-4">
                    <Medal size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Interests</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((exp, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Section */}
                <div>
                  <div className="flex items-center space-x-2 text-gray-400 mb-3">
                    <Mail size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Contact</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 break-all">
                    {member.email || 'hive.daegu@gmail.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MemberModal;
