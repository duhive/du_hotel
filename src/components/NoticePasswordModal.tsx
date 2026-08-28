import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, AlertCircle } from 'lucide-react';

interface NoticePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}

export default function NoticePasswordModal({
  isOpen,
  onClose,
  onSuccess,
  title = '관리자 비밀번호 확인',
  subtitle = '공지사항 작성 및 수정/삭제 권한을 확인합니다.'
}: NoticePasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '2405') {
      setPassword('');
      setError(false);
      onSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-100 text-center"
        >
          <button
            onClick={() => {
              setPassword('');
              setError(false);
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-hive-green/10 text-hive-green flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 mb-1">{title}</h3>
          <p className="text-xs text-slate-500 mb-5">{subtitle}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                autoFocus
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="비밀번호 4자리"
                className="w-full text-center tracking-widest text-base font-extrabold p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-hive-green"
              />
              {error && (
                <p className="text-xs text-rose-500 font-bold mt-2 flex items-center justify-center gap-1">
                  <AlertCircle size={13} />
                  비밀번호가 올바르지 않습니다.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPassword('');
                  setError(false);
                  onClose();
                }}
                className="w-1/2 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-hive-green hover:bg-hive-green/90 text-white rounded-xl text-xs font-extrabold transition-colors shadow-xs cursor-pointer"
              >
                확인
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
