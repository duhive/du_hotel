import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Upload, Image as ImageIcon, Trash2, Sparkles, Check, AlertCircle } from 'lucide-react';
import { NoticeItem } from '../types';
import cabinServiceAbout from '../assets/images/cabin_service_about_1782193310292.jpg';
import aviationHero from '../assets/images/aviation_service_hero_1782037825374.jpg';
import metaverseHero from '../assets/images/metaverse_hotel_hero_1782191831140.jpg';

interface NoticeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNotice?: NoticeItem | null;
  onSave: (noticeData: Omit<NoticeItem, 'id'> & { id?: string | number }) => void;
}

export const NOTICE_CATEGORY_PRESETS = [
  '전체공지',
  '학술세미나',
  '채용/인턴십',
  '행사/교류',
  '학회소식',
  '기타'
];

export const PRESET_PHOTOS = [
  { label: '서비스 디자인 세미나', url: cabinServiceAbout },
  { label: '항공/관광 세미나', url: aviationHero },
  { label: '호스피탈리티 테크', url: metaverseHero },
  { label: '글로벌 심포지엄', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000' },
  { label: '학회 교류회', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000' }
];

export default function NoticeFormModal({
  isOpen,
  onClose,
  editingNotice,
  onSave
}: NoticeFormModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('HIVE 학회 임원진');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('전체공지');
  const [isImportant, setIsImportant] = useState(false);
  const [content, setContent] = useState('');
  
  // Image attachments state
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (editingNotice) {
      setTitle(editingNotice.title || '');
      setAuthor(editingNotice.author || 'HIVE 학회 임원진');
      setDate(editingNotice.date || new Date().toISOString().split('T')[0]);
      setCategory(editingNotice.category || '전체공지');
      setIsImportant(editingNotice.isImportant || false);
      setContent(editingNotice.content || '');
      
      const existingImages: string[] = [];
      if (editingNotice.imageUrl) existingImages.push(editingNotice.imageUrl);
      if (editingNotice.images && Array.isArray(editingNotice.images)) {
        editingNotice.images.forEach(img => {
          if (img && !existingImages.includes(img)) existingImages.push(img);
        });
      }
      setImages(existingImages);
    } else {
      setTitle('');
      setAuthor('HIVE 학회 임원진');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('전체공지');
      setIsImportant(false);
      setContent('');
      setImages([]);
    }
    setCustomImageUrl('');
    setUploadError(null);
  }, [editingNotice, isOpen]);

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('이미지 용량은 파일당 5MB 이하만 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setImages(prev => prev.includes(dataUrl) ? prev : [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    const url = customImageUrl.trim();
    if (!images.includes(url)) {
      setImages(prev => [...prev, url]);
    }
    setCustomImageUrl('');
  };

  const handleSelectPresetPhoto = (url: string) => {
    if (!images.includes(url)) {
      setImages(prev => [...prev, url]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: editingNotice ? editingNotice.id : undefined,
      title: title.trim(),
      author: author.trim() || 'HIVE 학회 임원진',
      date: date,
      category: category,
      isImportant: isImportant,
      content: content.trim() || '공지사항 상세 내용이 없습니다.',
      imageUrl: images.length > 0 ? images[0] : undefined,
      images: images
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto py-8">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl relative border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-hive-green bg-hive-green/10 px-2.5 py-0.5 rounded-full">
                {editingNotice ? 'Notice Edit' : 'New Notice'}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                {editingNotice ? '공지사항 수정' : '새 공지사항 등록'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content Scrollable */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-grow">
            {/* Top toggles: Importance & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="noticeIsImportant"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                />
                <label htmlFor="noticeIsImportant" className="text-xs font-bold text-rose-600 cursor-pointer select-none">
                  🚨 중요 공지사항으로 상단 고정
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  카테고리 구분
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs font-extrabold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-hive-green"
                >
                  {NOTICE_CATEGORY_PRESETS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                공지 제목 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="공지사항 제목을 입력하세요"
                className="w-full text-sm font-extrabold p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-hive-green"
              />
            </div>

            {/* Author & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">작성자</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="예: HIVE 학회 임원진"
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-hive-green"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">게시 날짜</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-hive-green"
                />
              </div>
            </div>

            {/* Photo / Image Attachment Section */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-hive-green" />
                  사진 첨부 (Photo Attachments)
                </span>
                <span className="text-[11px] font-normal text-slate-400">
                  직접 업로드 또는 URL / 추천 샘플 선택
                </span>
              </label>

              {/* Upload Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Local File Upload Button */}
                <label className="border-2 border-dashed border-slate-200 hover:border-hive-green bg-slate-50 hover:bg-hive-green/5 p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-bold text-slate-600">
                  <Upload className="w-4 h-4 text-hive-green" />
                  <span>내 기기에서 사진 파일 선택</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Custom URL Input */}
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https:// 이미지 웹 URL 입력"
                    className="flex-grow text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-hive-green"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomImageUrl}
                    className="px-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                  >
                    추가
                  </button>
                </div>
              </div>

              {uploadError && (
                <p className="text-xs text-rose-500 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {uploadError}
                </p>
              )}

              {/* Preset Sample Photos */}
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 block mb-1.5">
                  💡 추천 이미지 즉시 선택:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PHOTOS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleSelectPresetPhoto(preset.url)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-hive-green hover:text-white rounded-lg text-[11px] font-bold text-slate-600 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Uploaded Images Preview Grid */}
              {images.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-extrabold text-slate-700 block mb-2">
                    첨부된 이미지 ({images.length}장)
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((imgUrl, imgIdx) => (
                      <div key={imgIdx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
                        <img src={imgUrl} alt={`Attachment ${imgIdx + 1}`} className="w-full h-full object-cover" />
                        {imgIdx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-hive-green text-white text-[9px] font-black rounded-md">
                            대표
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(imgIdx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                상세 공지 내용 <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={7}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="공지사항 상세 내용을 작성하세요 (줄바꿈 및 마크다운 형식을 지원합니다)..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-hive-green resize-y"
              />
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-hive-green hover:bg-hive-green/90 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingNotice ? '수정 완료' : '공지 등록하기'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
