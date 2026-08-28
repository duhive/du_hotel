import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, User, Lightbulb, Save, Loader2, Sparkles } from 'lucide-react';
import { MEMBERS, PARTNER_MEMBERS } from '../constants';

const ALL_MEMBERS = [...MEMBERS, ...PARTNER_MEMBERS].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
const DEFAULT_AVATAR = 'https://i.ibb.co/TGvX4D7/28.png';

export interface PresenterInfo {
  name: string;
  role: string;
  affiliation: string;
  image: string;
}

export interface SeminarTopicData {
  id?: string;
  title: string;
  category: string;
  description: string;
  round: number; // 1 or 2
  presenter: PresenterInfo;
}

interface SeminarTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTopic: SeminarTopicData | null;
  defaultRound?: number;
  onSave: (data: SeminarTopicData) => Promise<void>;
}

const CATEGORY_PRESETS = [
  '로컬 관광 개발',
  '스포츠 레저 관광',
  '축제 경제학',
  '호스피탈리티',
  '목적지 브랜딩',
  '경험 디자인 (CX)',
  '소도시 활성화',
  '모빌리티 & 크루즈',
  '거시경제 분석',
  '문화유산 연계',
  '항공 모빌리티',
  '스마트 관광 AI'
];

export default function SeminarTopicModal({
  isOpen,
  onClose,
  editingTopic,
  defaultRound = 1,
  onSave
}: SeminarTopicModalProps) {
  const [round, setRound] = useState<number>(defaultRound);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORY_PRESETS[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');

  // Presenter fields
  const [selectedMemberId, setSelectedMemberId] = useState<string>('custom');
  const [presenterName, setPresenterName] = useState('');
  const [presenterRole, setPresenterRole] = useState('YB');
  const [presenterAffiliation, setPresenterAffiliation] = useState('호텔외식관광학과 23');
  const [presenterImage, setPresenterImage] = useState(DEFAULT_AVATAR);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTopic) {
      setRound(editingTopic.round || 1);
      setTitle(editingTopic.title || '');
      setDescription(editingTopic.description || '');

      if (CATEGORY_PRESETS.includes(editingTopic.category)) {
        setCategory(editingTopic.category);
        setCustomCategory('');
      } else {
        setCategory('custom');
        setCustomCategory(editingTopic.category || '');
      }

      if (editingTopic.presenter) {
        setPresenterName(editingTopic.presenter.name || '');
        setPresenterRole(editingTopic.presenter.role || '학회원');
        setPresenterAffiliation(editingTopic.presenter.affiliation || '호텔외식관광학과');
        setPresenterImage(editingTopic.presenter.image || DEFAULT_AVATAR);

        const matched = ALL_MEMBERS.find(m => m.name === editingTopic.presenter.name);
        if (matched) {
          setSelectedMemberId(String(matched.id));
        } else {
          setSelectedMemberId('custom');
        }
      }
    } else {
      setRound(defaultRound);
      setTitle('');
      setCategory(CATEGORY_PRESETS[0]);
      setCustomCategory('');
      setDescription('');
      setSelectedMemberId('custom');
      setPresenterName('');
      setPresenterRole('YB');
      setPresenterAffiliation('호텔외식관광학과 23');
      setPresenterImage(DEFAULT_AVATAR);
    }
    setError(null);
  }, [editingTopic, defaultRound, isOpen]);

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedMemberId(val);

    if (val === 'custom') {
      return;
    }

    const matched = ALL_MEMBERS.find(m => String(m.id) === val);
    if (matched) {
      setPresenterName(matched.name);
      setPresenterRole(matched.role || '학회원');
      setPresenterAffiliation(matched.education || '호텔외식관광학과');
      setPresenterImage(matched.image || DEFAULT_AVATAR);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalCategory = category === 'custom' ? customCategory.trim() : category;

    if (!title.trim() || title.trim().length < 2) {
      setError('발표 주제 제목을 2자 이상 입력해 주세요.');
      return;
    }

    if (!finalCategory) {
      setError('카테고리를 선택하거나 입력해 주세요.');
      return;
    }

    if (!presenterName.trim()) {
      setError('발표자 이름을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: editingTopic?.id,
        round,
        title: title.trim(),
        category: finalCategory,
        description: description.trim(),
        presenter: {
          name: presenterName.trim(),
          role: presenterRole.trim() || '학회원',
          affiliation: presenterAffiliation.trim() || '호텔외식관광학과',
          image: presenterImage.trim() || DEFAULT_AVATAR
        }
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError('저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-navy-900/10 my-8"
      >
        {/* Header */}
        <div className="p-6 border-b border-navy-900/5 flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-hive-green/10 text-hive-green rounded-xl">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-navy-900 text-base">
                {editingTopic ? '학술 세미나 발표 주제 수정' : '새 학술 세미나 발표 주제 등록'}
              </h5>
              <p className="text-[11px] text-navy-900/50 font-semibold">
                학회원의 발표 주제와 프로필 정보를 등록/수정합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-navy-900/5 text-navy-900/40 hover:text-navy-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
              <X className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Round Selection */}
          <div>
            <label className="block text-[11px] font-black text-navy-900 uppercase tracking-wider mb-2">
              발표 차수 구별 *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRound(1)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  round === 1
                    ? 'bg-hive-green text-white border-hive-green shadow-xs'
                    : 'bg-ivory border-navy-900/10 text-navy-900/60 hover:bg-navy-900/5'
                }`}
              >
                1차 학술 세미나 발표
              </button>
              <button
                type="button"
                onClick={() => setRound(2)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  round === 2
                    ? 'bg-hive-green text-white border-hive-green shadow-xs'
                    : 'bg-ivory border-navy-900/10 text-navy-900/60 hover:bg-navy-900/5'
                }`}
              >
                2차 글로벌 관광 이슈 분석
              </button>
            </div>
          </div>

          {/* Presenter Info */}
          <div className="p-4 bg-navy-900/5 rounded-2xl space-y-3.5 border border-navy-900/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-hive-green" /> 발표자 프로필 설정 *
              </label>
              <span className="text-[10px] text-navy-900/40 font-semibold">HIVE 학회원 연동 가능</span>
            </div>

            {/* Member Dropdown */}
            <div>
              <label className="block text-[10px] font-bold text-navy-900/60 mb-1">
                학회원 명단에서 선택
              </label>
              <select
                value={selectedMemberId}
                onChange={handleMemberSelect}
                className="w-full px-3 py-2 rounded-xl border border-navy-900/15 text-xs font-bold bg-white text-navy-900 focus:outline-none focus:border-hive-green"
              >
                <option value="custom">직접 입력 (Custom)</option>
                {ALL_MEMBERS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role} · {m.education})
                  </option>
                ))}
              </select>
            </div>

            {/* Presenter Subfields */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-navy-900/60 mb-1">발표자 성명 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 송진혁"
                  value={presenterName}
                  onChange={(e) => setPresenterName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-navy-900/15 text-xs font-bold bg-white text-navy-900 focus:outline-none focus:border-hive-green"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-navy-900/60 mb-1">역할 / 직책</label>
                <input
                  type="text"
                  placeholder="예: YB, 학회장, PR"
                  value={presenterRole}
                  onChange={(e) => setPresenterRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-navy-900/15 text-xs font-bold bg-white text-navy-900 focus:outline-none focus:border-hive-green"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-navy-900/60 mb-1">소속 / 학과 학번</label>
                <input
                  type="text"
                  placeholder="예: 호텔외식관광학과 23"
                  value={presenterAffiliation}
                  onChange={(e) => setPresenterAffiliation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-navy-900/15 text-xs font-bold bg-white text-navy-900 focus:outline-none focus:border-hive-green"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-navy-900/60 mb-1">프로필 이미지 URL</label>
                <input
                  type="text"
                  placeholder="이미지 URL"
                  value={presenterImage}
                  onChange={(e) => setPresenterImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-navy-900/15 text-xs font-bold bg-white text-navy-900 focus:outline-none focus:border-hive-green"
                />
              </div>
            </div>

            {/* Preview Pill */}
            {presenterName && (
              <div className="flex items-center gap-3 pt-2 border-t border-navy-900/10">
                <img
                  src={presenterImage || DEFAULT_AVATAR}
                  alt={presenterName}
                  className="w-9 h-9 rounded-full object-cover border border-navy-900/20 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    <span>{presenterName}</span>
                    <span className="px-1.5 py-0.5 bg-hive-green/20 text-navy-900 text-[10px] font-extrabold rounded">
                      {presenterRole}
                    </span>
                  </div>
                  <div className="text-[10px] text-navy-900/60 font-semibold truncate">
                    {presenterAffiliation}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-black text-navy-900 uppercase tracking-wider mb-1.5">
              분야 및 주제 카테고리 *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-navy-900/10 text-xs font-bold focus:outline-none focus:border-hive-green mb-2"
            >
              {CATEGORY_PRESETS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="custom">직접 입력</option>
            </select>

            {category === 'custom' && (
              <input
                type="text"
                required
                placeholder="카테고리명을 직접 입력해 주세요 (예: 글로벌 관광 테크)"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-900/10 text-xs font-bold focus:outline-none focus:border-hive-green"
              />
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-black text-navy-900 uppercase tracking-wider mb-1.5">
              발표 주제 제목 *
            </label>
            <input
              type="text"
              required
              placeholder="예: 제주특별자치도 관광 산업의 발전 전략"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-navy-900/10 text-xs font-bold focus:outline-none focus:border-hive-green"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-black text-navy-900 uppercase tracking-wider mb-1.5">
              주제 상세 개요 및 발표 서술 *
            </label>
            <textarea
              required
              rows={4}
              placeholder="발표 주제의 핵심 연구 목적, 이슈 분석 내용, 기대 효과를 상세히 서술해 주세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-navy-900/10 text-xs font-bold focus:outline-none focus:border-hive-green resize-none"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-navy-900/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-navy-900/60 bg-navy-900/5 hover:bg-navy-900/10 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-hive-green text-white hover:bg-hive-green/90 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{editingTopic ? '수정 완료' : '발표 주제 등록'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
