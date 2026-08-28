import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, User, AlertCircle, HelpCircle, Link as LinkIcon, ChevronDown } from 'lucide-react';
import { Column } from '../types';
import { MEMBERS, PARTNER_MEMBERS } from '../constants';

const ALL_MEMBERS = [...MEMBERS, ...PARTNER_MEMBERS].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
const DEFAULT_CHARACTER_IMAGE = 'https://i.ibb.co/TGvX4D7/28.png';

interface ColumnFormProps {
  editingColumn: Column | null;
  onSave: (columnData: Omit<Column, 'id' | 'likes' | 'createdAt'> & { id?: string; likes?: number; createdAt?: any }) => Promise<void>;
  onClose: () => void;
}

export const CATEGORY_PRESETS = [
  '1차수',
  '2차수',
  '3차수'
];

const COVER_PRESETS = [
  { name: 'AI & Future', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800' },
  { name: 'Modern Hotel', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
  { name: 'Cafe & Service', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800' },
  { name: 'Data & Tech', url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800' },
  { name: 'Green Travel', url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800' }
];

const AUTHOR_IMAGE_PRESETS = [
  { name: 'Professional Male', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150' },
  { name: 'Professional Female', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
  { name: 'Smart Male', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { name: 'Smart Female', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }
];

export default function ColumnForm({
  editingColumn,
  onSave,
  onClose
}: ColumnFormProps) {
  // Main form fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('1차수');
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);
  const [readTime, setReadTime] = useState('5 min read');
  const [tagInput, setTagInput] = useState('');

  // Author linkage state
  const [selectedMemberId, setSelectedMemberId] = useState<string>('custom');
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);

  // Author sub-fields
  const [authorName, setAuthorName] = useState('김지민');
  const [authorRole, setAuthorRole] = useState('학회원 / 연구원');
  const [authorAffiliation, setAuthorAffiliation] = useState('호스피탈리티 경영학회 HIVE');
  const [authorImage, setAuthorImage] = useState(DEFAULT_CHARACTER_IMAGE);

  // Status fields
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-populate if editing
  useEffect(() => {
    if (editingColumn) {
      setTitle(editingColumn.title || '');
      setSubtitle(editingColumn.subtitle || '');
      setExcerpt(editingColumn.excerpt || '');
      setContent(editingColumn.content || '');
      setCategory(editingColumn.category || '1차수');
      setCoverImage(editingColumn.coverImage || COVER_PRESETS[0].url);
      setReadTime(editingColumn.readTime || '5 min read');
      setTagInput(editingColumn.tags ? editingColumn.tags.join(', ') : '');

      if (editingColumn.author) {
        setAuthorName(editingColumn.author.name || '');
        setAuthorRole(editingColumn.author.role || '');
        setAuthorAffiliation(editingColumn.author.affiliation || '');
        setAuthorImage(editingColumn.author.image || DEFAULT_CHARACTER_IMAGE);

        // Find match in our members
        const matched = ALL_MEMBERS.find(m => m.name === editingColumn.author.name);
        if (matched) {
          setSelectedMemberId(String(matched.id));
        } else {
          setSelectedMemberId('custom');
        }
      }
    } else {
      setSelectedMemberId('custom');
      setAuthorName('');
      setAuthorRole('');
      setAuthorAffiliation('');
      setAuthorImage(DEFAULT_CHARACTER_IMAGE);
    }
  }, [editingColumn]);

  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(memberId);
    if (memberId === 'custom') {
      setAuthorName('');
      setAuthorRole('');
      setAuthorAffiliation('');
      setAuthorImage(DEFAULT_CHARACTER_IMAGE);
    } else {
      const found = ALL_MEMBERS.find(m => String(m.id) === memberId);
      if (found) {
        setAuthorName(found.name);
        setAuthorRole(found.role);
        setAuthorAffiliation(found.education || 'HIVE');
        setAuthorImage(found.image || DEFAULT_CHARACTER_IMAGE);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Dynamic field validation to strictly match Firestore rules
    if (title.trim().length < 2 || title.trim().length > 200) {
      setErrorMessage('제목은 2자 이상 200자 이하로 작성해 주세요.');
      return;
    }
    if (subtitle.trim().length > 300) {
      setErrorMessage('부제목은 300자 이하로 작성해 주세요.');
      return;
    }
    if (excerpt.trim().length < 2 || excerpt.trim().length > 1000) {
      setErrorMessage('요약본은 2자 이상 1000자 이하로 작성해 주세요.');
      return;
    }
    if (content.trim().length < 5) {
      setErrorMessage('본문 내용은 5자 이상 작성해 주세요.');
      return;
    }
    if (content.trim().length > 50000) {
      setErrorMessage('본문 분량 제한(50,000자)을 초과했습니다.');
      return;
    }
    if (authorName.trim().length < 2 || authorName.trim().length > 100) {
      setErrorMessage('작성자 이름은 2자 이상 100자 이하로 작성해 주세요.');
      return;
    }
    if (authorRole.trim().length > 100) {
      setErrorMessage('역할/직책은 100자 이하로 작성해 주세요.');
      return;
    }
    if (authorAffiliation.trim().length > 200) {
      setErrorMessage('소속은 200자 이하로 작성해 주세요.');
      return;
    }

    setIsSubmitting(true);

    // Process tag array
    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0 && t.length <= 50)
      .slice(0, 10); // Max 10 tags

    const todayString = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace(/\.$/, '');

    const columnPayload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category,
      coverImage: coverImage.trim(),
      readTime: readTime.trim() || '5 min read',
      tags,
      date: editingColumn?.date || todayString,
      author: {
        name: authorName.trim(),
        role: authorRole.trim() || '학회원 / 연구원',
        affiliation: authorAffiliation.trim() || 'HIVE',
        image: authorImage.trim()
      },
      ...(editingColumn ? { id: editingColumn.id, likes: editingColumn.likes, createdAt: editingColumn.createdAt } : {})
    };

    try {
      await onSave(columnPayload);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || '저장 중 문제가 발생했습니다. 입력 정보를 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-xl w-full max-w-3xl overflow-hidden"
      >
        {/* Form Header */}
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingColumn ? '학술 칼럼 수정' : '새 학술 칼럼 투고'}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              호스피탈리티 경영과 테크 산업 융합에 대한 심도 깊은 기고문을 게재하세요.
            </p>
          </div>
          <button
            id="close-form-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-150 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          {/* Section 1: Title & Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-1.5 uppercase tracking-wider">
              1. 기고 정보 및 카테고리
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">카테고리 *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                >
                  {CATEGORY_PRESETS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">칼럼 대제목 (2자 이상 200자 이하) *</label>
              <input
                type="text"
                required
                placeholder="칼럼의 명확하고 강렬한 제목을 작성해 주세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>



            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">요약문 / 핵심 초록 (2자 이상 1000자 이하) *</label>
              <textarea
                required
                rows={2}
                placeholder="칼럼 목록 카드에 노출될 수 있도록 핵심 아이디어를 2~3줄로 압축 서술해 주세요."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 2: Author details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-1.5 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span>2. 기고가 정보</span>
            </h3>

            {/* NEW Dropdown to link member profile */}
            <div className="bg-emerald-50/50 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <LinkIcon className="w-4 h-4 text-emerald-600" />
                <span>HIVE 학회원 프로필 연동</span>
              </div>
              <p className="text-xs text-emerald-800/70 leading-relaxed">
                등록된 학회원을 선택하면 이름, 역할, 소속기관 및 프로필 이미지가 자동으로 연동됩니다. 
                목록에 없는 분들도 직접 입력이 가능하며, 이때 프로필 이미지는 기본 캐릭터 일러스트로 설정됩니다.
              </p>
              
              <div className="relative">
                {/* Custom select trigger button */}
                <button
                  type="button"
                  onClick={() => setIsAuthorDropdownOpen(!isAuthorDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-emerald-500/30 rounded-xl text-sm font-medium text-emerald-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2 text-left">
                    {selectedMemberId === 'custom' ? (
                      <>
                        <img
                          src={DEFAULT_CHARACTER_IMAGE}
                          className="w-6 h-6 rounded-full object-cover border border-emerald-100 shrink-0"
                          referrerPolicy="no-referrer"
                          alt="Default Avatar"
                        />
                        <span>👤 직접 입력 / 등록되지 않은 사용자 (기본 캐릭터 설정)</span>
                      </>
                    ) : (
                      (() => {
                        const m = ALL_MEMBERS.find(member => String(member.id) === selectedMemberId);
                        if (!m) return <span>직접 입력 / 등록되지 않은 사용자</span>;
                        return (
                          <>
                            <img
                              src={m.image || DEFAULT_CHARACTER_IMAGE}
                              className="w-6 h-6 rounded-full object-cover border border-emerald-100 shrink-0"
                              referrerPolicy="no-referrer"
                              alt={m.name}
                            />
                            <span>
                              {m.name} {m.category === 'Professor Group' ? '교수' : `(${m.role})`}
                            </span>
                          </>
                        );
                      })()
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-emerald-700 opacity-60" />
                </button>

                {/* Dropdown Options */}
                {isAuthorDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsAuthorDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1.5 max-h-80 overflow-y-auto bg-white border border-emerald-100 rounded-2xl shadow-xl z-50 divide-y divide-gray-100">
                      
                      {/* Option: Custom/Direct entry */}
                      <div
                        onClick={() => {
                          handleMemberSelect('custom');
                          setIsAuthorDropdownOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 cursor-pointer transition-colors ${
                          selectedMemberId === 'custom' ? 'bg-emerald-50/70 font-bold' : ''
                        }`}
                      >
                        <img
                          src={DEFAULT_CHARACTER_IMAGE}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-100"
                          referrerPolicy="no-referrer"
                          alt="Default Avatar"
                        />
                        <div className="text-xs text-gray-700">
                          <span className="font-semibold block">직접 입력 / 등록되지 않은 사용자</span>
                          <span className="text-[10px] text-gray-400">기본 캐릭터로 설정됩니다.</span>
                        </div>
                      </div>

                      {/* 교수 */}
                      {PARTNER_MEMBERS.filter(m => m.category === 'Professor Group').length > 0 && (
                        <div className="py-2">
                          <div className="px-4 py-1 text-[9px] font-black text-emerald-800 bg-emerald-500/5 uppercase tracking-widest select-none mb-1">
                            🎓 교수 (Professor)
                          </div>
                          {PARTNER_MEMBERS.filter(m => m.category === 'Professor Group').map((member) => (
                            <div
                              key={member.id}
                              onClick={() => {
                                handleMemberSelect(String(member.id));
                                setIsAuthorDropdownOpen(false);
                              }}
                              className={`flex items-center gap-3 px-4 py-2 hover:bg-emerald-50 cursor-pointer transition-colors ${
                                selectedMemberId === String(member.id) ? 'bg-emerald-50/70 font-bold' : ''
                              }`}
                            >
                              <img
                                src={member.image || DEFAULT_CHARACTER_IMAGE}
                                className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-200"
                                referrerPolicy="no-referrer"
                                alt={member.name}
                              />
                              <div className="text-xs text-gray-850">
                                <span className="font-semibold block">{member.name} 교수</span>
                                <span className="text-[10px] text-gray-400">{member.role} - {member.education}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* HIVE 학회원 */}
                      {MEMBERS.length > 0 && (
                        <div className="py-2">
                          <div className="px-4 py-1 text-[9px] font-black text-emerald-800 bg-emerald-500/5 uppercase tracking-widest select-none mb-1">
                            🐝 HIVE 학회원
                          </div>
                          {MEMBERS.map((member) => (
                            <div
                              key={member.id}
                              onClick={() => {
                                handleMemberSelect(String(member.id));
                                setIsAuthorDropdownOpen(false);
                              }}
                              className={`flex items-center gap-3 px-4 py-2 hover:bg-emerald-50 cursor-pointer transition-colors ${
                                selectedMemberId === String(member.id) ? 'bg-emerald-50/70 font-bold' : ''
                              }`}
                            >
                              <img
                                src={member.image || DEFAULT_CHARACTER_IMAGE}
                                className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-200"
                                referrerPolicy="no-referrer"
                                alt={member.name}
                              />
                              <div className="text-xs text-gray-850">
                                <span className="font-semibold block">{member.name}</span>
                                <span className="text-[10px] text-gray-400">{member.role} - {member.education}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 파트너 그룹 */}
                      {['Global Service Group', 'Tourism & AI Group'].map((grp) => {
                        const grpMembers = PARTNER_MEMBERS.filter(m => m.category === grp);
                        if (grpMembers.length === 0) return null;
                        return (
                          <div key={grp} className="py-2">
                            <div className="px-4 py-1 text-[9px] font-black text-emerald-800 bg-emerald-500/5 uppercase tracking-widest select-none mb-1">
                              💼 파트너 - {grp === 'Global Service Group' ? 'Global Service Group' : 'Tourism & AI Group'}
                            </div>
                            {grpMembers.map((member) => (
                              <div
                                key={member.id}
                                onClick={() => {
                                  handleMemberSelect(String(member.id));
                                  setIsAuthorDropdownOpen(false);
                                }}
                                className={`flex items-center gap-3 px-4 py-2 hover:bg-emerald-50 cursor-pointer transition-colors ${
                                  selectedMemberId === String(member.id) ? 'bg-emerald-50/70 font-bold' : ''
                                }`}
                              >
                                <img
                                  src={member.image || DEFAULT_CHARACTER_IMAGE}
                                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-200"
                                  referrerPolicy="no-referrer"
                                  alt={member.name}
                                />
                                <div className="text-xs text-gray-850">
                                  <span className="font-semibold block">{member.name}</span>
                                  <span className="text-[10px] text-gray-400">{member.role} - {member.education || 'HIVE'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">이름 *</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center justify-center">
                    <img
                      src={authorImage || DEFAULT_CHARACTER_IMAGE}
                      alt="Profile"
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover border border-gray-150 shrink-0"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="예: 김지민"
                    value={authorName}
                    onChange={(e) => {
                      const nameValue = e.target.value;
                      setAuthorName(nameValue);
                      const matched = ALL_MEMBERS.find(m => m.name === nameValue);
                      if (!matched) {
                        setSelectedMemberId('custom');
                      } else {
                        setSelectedMemberId(String(matched.id));
                        setAuthorImage(matched.image || DEFAULT_CHARACTER_IMAGE);
                        setAuthorRole(matched.role);
                        setAuthorAffiliation(matched.education || 'HIVE');
                      }
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">역할 / 직함 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 학회원 / 수석 연구원"
                  value={authorRole}
                  onChange={(e) => {
                    setAuthorRole(e.target.value);
                    setSelectedMemberId('custom');
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">소속 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 호텔외식관광학과 / HIVE"
                  value={authorAffiliation}
                  onChange={(e) => {
                    setAuthorAffiliation(e.target.value);
                    setSelectedMemberId('custom');
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Content & Tags */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-1.5 uppercase tracking-wider">
              4. 학술 칼럼 내용 및 키워드
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700">칼럼 본문 (마크다운 작성 지원, 최대 50,000자) *</label>
                <span className="text-[10px] text-gray-400 font-medium">Markdown 형식을 지원합니다 (## 소제목, - 리스트 등)</span>
              </div>
              <textarea
                required
                rows={10}
                placeholder="이곳에 깊이 있는 논증과 분석을 담은 학술 칼럼 본문을 자유롭게 서술해 주세요..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">태그 키워드 (쉼표로 구분하여 입력, 예: AI, 빅데이터, 스마트관광)</label>
              <input
                type="text"
                placeholder="쉼표로 구분하여 최대 10개의 태그를 입력하세요"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              id="cancel-btn"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-200 text-sm font-bold text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              id="save-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-sm font-bold text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? '저장 중...' : editingColumn ? '수정 완료' : '학술 칼럼 투고'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
