import React, { useState } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowLeft, Calendar, User, Edit2, Trash2, X, Bell, 
  Share2, Check, Image as ImageIcon, Maximize2, ShieldCheck, ChevronLeft, ChevronRight
} from 'lucide-react';
import { NoticeItem } from '../types';

interface NoticeDetailProps {
  notice: NoticeItem;
  onEdit: (notice: NoticeItem) => void;
  onDelete: (noticeId: string | number) => void;
  onBack: () => void;
  prevNotice?: NoticeItem | null;
  nextNotice?: NoticeItem | null;
  onSelectNotice?: (notice: NoticeItem) => void;
}

export default function NoticeDetail({
  notice,
  onEdit,
  onDelete,
  onBack,
  prevNotice,
  nextNotice,
  onSelectNotice
}: NoticeDetailProps) {
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(
    notice.imageUrl || (notice.images && notice.images.length > 0 ? notice.images[0] : null)
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (notice.imageUrl) list.push(notice.imageUrl);
    if (notice.images && Array.isArray(notice.images)) {
      notice.images.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [notice]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryLabel = notice.category || '공지사항';

  return (
    <motion.div
      id="notice-detail-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden p-6 md:p-10 my-6 animate-fade-in"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>공지 목록으로 돌아가기</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-hive-green px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-slate-200/60 transition-all cursor-pointer"
            title="공지 링크 복사"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-hive-green" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? '복사됨!' : '공유하기'}</span>
          </button>
          
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notice Metadata Badges */}
      <div className="mb-6">
        <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider mb-4">
          {notice.isImportant && (
            <span className="px-2.5 py-1 text-[10px] font-black bg-rose-500 text-white rounded-md shadow-2xs flex items-center gap-1">
              <Bell className="w-3 h-3" />
              중요 공지
            </span>
          )}
          <span className="px-2.5 py-1 text-[10px] font-extrabold bg-hive-green/10 text-hive-green border border-hive-green/20 rounded-md">
            {categoryLabel}
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-slate-500 font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{notice.date}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mb-6">
          {notice.title}
        </h1>

        {/* Author & Publisher Info Card */}
        <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 shadow-2xs flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-hive-green flex items-center justify-center font-black text-sm shadow-xs border border-slate-800">
              HIVE
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-slate-900 text-sm">{notice.author || 'HIVE 학회 관리자'}</h4>
                <ShieldCheck className="w-4 h-4 text-hive-green" />
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                호스피탈리티 경영학회 HIVE 공식 안내문
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-400 font-mono hidden sm:block">
            <div>게시일: {notice.date}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Official Notice</div>
          </div>
        </div>
      </div>

      {/* Featured Photo / Image Display Section */}
      {allImages.length > 0 && (
        <div className="mb-8 space-y-3">
          <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-sm">
            <img
              src={activeImage || allImages[0]}
              alt={notice.title}
              className="w-full max-h-[480px] object-contain mx-auto bg-slate-950 transition-transform duration-300 group-hover:scale-[1.01]"
            />
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-xl hover:bg-slate-900 transition-colors shadow-md backdrop-blur-xs cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>확대 보기</span>
            </button>
          </div>

          {/* Additional Photos Thumbnails if more than 1 image */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
                <ImageIcon className="w-3.5 h-3.5 text-hive-green" />
                첨부 사진 ({allImages.length})
              </span>
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    activeImage === imgUrl ? 'border-hive-green ring-2 ring-hive-green/30 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Attached ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notice Body Content */}
      <div className="bg-slate-50/70 border border-slate-200/60 rounded-2xl p-6 md:p-8 mb-8 text-slate-800 text-sm md:text-base leading-relaxed whitespace-pre-line min-h-[200px]">
        {notice.content.includes('#') || notice.content.includes('*') ? (
          <div className="markdown-body prose max-w-none">
            <ReactMarkdown>{notice.content}</ReactMarkdown>
          </div>
        ) : (
          notice.content
        )}
      </div>

      {/* Notice Action Buttons (Edit & Delete protected by passcode 2405) */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(notice)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-600" />
            <span>공지 수정</span>
          </button>
          
          <button
            onClick={() => onDelete(notice.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200/60 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>공지 삭제</span>
          </button>
        </div>

        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-colors shadow-xs cursor-pointer"
        >
          목록으로
        </button>
      </div>

      {/* Next / Previous Notice Navigation */}
      {(prevNotice || nextNotice) && (
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {prevNotice ? (
            <button
              onClick={() => onSelectNotice && onSelectNotice(prevNotice)}
              className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-hive-green/40 hover:bg-slate-50 transition-all text-left group cursor-pointer"
            >
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                <ChevronLeft className="w-3.5 h-3.5" />
                이전 공지
              </div>
              <div className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-hive-green transition-colors">
                {prevNotice.title}
              </div>
            </button>
          ) : <div />}

          {nextNotice ? (
            <button
              onClick={() => onSelectNotice && onSelectNotice(nextNotice)}
              className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-hive-green/40 hover:bg-slate-50 transition-all text-right group cursor-pointer"
            >
              <div className="text-[10px] font-bold text-slate-400 flex items-center justify-end gap-1 mb-1">
                다음 공지
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-hive-green transition-colors">
                {nextNotice.title}
              </div>
            </button>
          ) : <div />}
        </div>
      )}

      {/* Lightbox Modal for Photo Enlargement */}
      {isLightboxOpen && activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 p-2 bg-white/20 text-white hover:bg-white/30 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activeImage}
            alt="Enlarged notice view"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </motion.div>
  );
}
