import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Search, Plus, Calendar, User, ChevronRight, 
  Image as ImageIcon, Edit2, Trash2, Filter, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { NoticeItem } from '../types';
import NoticeDetail from '../components/NoticeDetail';
import NoticeFormModal from '../components/NoticeFormModal';
import NoticePasswordModal from '../components/NoticePasswordModal';
import cabinServiceAbout from '../assets/images/cabin_service_about_1782193310292.jpg';
import aviationHero from '../assets/images/aviation_service_hero_1782037825374.jpg';
import metaverseHero from '../assets/images/metaverse_hotel_hero_1782191831140.jpg';

const CATEGORY_TABS = [
  '전체',
  '중요공지',
  '학술세미나',
  '채용/인턴십',
  '행사/교류',
  '학회소식',
  '기타'
];

const INITIAL_NOTICES: NoticeItem[] = [
  {
    id: 'notice-default-1',
    isImportant: true,
    title: '2026 HIVE 학술 세미나 및 제1차 연구 칼럼 발표회 개최 안내',
    category: '학술세미나',
    date: '2026.08.05',
    author: 'HIVE 학술위원회',
    imageUrl: cabinServiceAbout,
    images: [cabinServiceAbout, aviationHero],
    content: `안녕하세요, 호스피탈리티 경영학회 HIVE입니다.

2026학년도 제1차 HIVE 학술 세미나 및 학술 칼럼 발표회가 아래와 같이 개최됩니다. 
금번 세미나에서는 회원 개별 연구 주제 발표와 서비스 DX(디지털 전환) 혁신 사례 분석 결과가 발표될 예정입니다.

■ 일시: 2026년 8월 20일 (목) 15:00 ~ 18:00
■ 장소: HIVE 멀티미디어 세미나실 (온라인 실시간 중계 병행)
■ 주요 프로그램:
  1. 개회사 및 학회 활동 경과 보고
  2. 세션 1: 로컬 관광 콘텐츠 설계와 스마트 환대 가치 (박유진 학회원)
  3. 세션 2: AI 자율주행 로보틱스 서비스 접점 분석
  4. 자유 토론 및 지도교수 총평

학회원 여러분의 많은 관심과 참여 바랍니다.`
  },
  {
    id: 'notice-default-2',
    isImportant: false,
    title: '2026학년도 하반기 HIVE 신입 회원 모집 및 오리엔테이션',
    category: '학회소식',
    date: '2026.08.01',
    author: 'HIVE 운영진',
    imageUrl: aviationHero,
    images: [aviationHero],
    content: `호스피탈리티 경영학회 HIVE에서 열정적인 2026 하반기 신입 학회원을 모집합니다.

■ 모집 대상: 호스피탈리티, 항공, 관광, 서비스 경영 및 DX 혁신에 관심 있는 대학생 및 대학원생
■ 지원 방법: HIVE 웹사이트 내 JOIN 메뉴를 통한 온라인 지원서 제출
■ 지원 서류 심사: ~ 2026.08.25 까지
■ 면접 및 합격자 발표: 개별 통보

미래 서비스 산업을 이끌어갈 도전적인 여러분의 지원을 기다립니다.`
  },
  {
    id: 'notice-default-3',
    isImportant: false,
    title: '글로벌 스마트 호텔 & 메타버스 서비스 DX 산학 협력 프로젝트',
    category: '채용/인턴십',
    date: '2026.07.28',
    author: 'HIVE 연구팀',
    imageUrl: metaverseHero,
    images: [metaverseHero],
    content: `HIVE 학회와 국내 산학 연계 지자체 관광개발 팀이 함께 추진하는 스마트 호텔 UX 분석 산학 프로젝트 팀원을 모집합니다.

■ 프로젝트 내용:
  - 스마트 호텔 비대면 체크인 및 IoT 서비스 블루프린트 설계
  - 메타버스 공간 기반 가상 컨시어지 서비스 시나리오 개발
  - 현장 데이터 수집 및 공공 데이터 기반 인터랙션 검증

관심 있는 학회원께서는 8월 15일까지 연구팀으로 신청해 주시기 바랍니다.`
  }
];

export default function Notices() {
  const [notices, setNotices] = useState<NoticeItem[]>(() => {
    const saved = localStorage.getItem('hive_notices');
    if (saved) {
      try {
        const parsed: NoticeItem[] = JSON.parse(saved);
        // Filter out old legacy test notices
        const filtered = parsed.filter(n => !(n.author === '김현정' && (n.title.includes('TOSOK') || n.title.includes('APTA'))));
        if (filtered.length > 0) return filtered;
      } catch (e) {
        console.error('Error parsing local notices', e);
      }
    }
    return INITIAL_NOTICES;
  });

  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [selectedTab, setSelectedTab] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // Password Verification State for Protected Actions
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    { type: 'create' } | 
    { type: 'edit'; notice: NoticeItem } | 
    { type: 'delete'; noticeId: string | number } | 
    null
  >(null);

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);

  // Sync with Firestore (collection 'notices')
  useEffect(() => {
    try {
      const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const fsNotices: NoticeItem[] = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              title: data.title || '',
              author: data.author || 'HIVE 학회 임원진',
              date: data.date || new Date().toISOString().split('T')[0],
              category: data.category || '전체공지',
              isImportant: !!data.isImportant,
              content: data.content || '',
              imageUrl: data.imageUrl || undefined,
              images: data.images || [],
              createdAt: data.createdAt
            };
          });
          setNotices(fsNotices);
        }
      }, (error) => {
        console.warn('Firestore notices snapshot listener fallback to localStorage:', error);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore initialization fallback:', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('hive_notices', JSON.stringify(notices));
  }, [notices]);

  // Handle protected actions requiring passcode '2405'
  const handleProtectedAction = (action: 
    { type: 'create' } | 
    { type: 'edit'; notice: NoticeItem } | 
    { type: 'delete'; noticeId: string | number }
  ) => {
    setPendingAction(action);
    setPasswordModalOpen(true);
  };

  const handlePasswordSuccess = () => {
    if (!pendingAction) return;

    if (pendingAction.type === 'create') {
      setEditingNotice(null);
      setIsFormOpen(true);
    } else if (pendingAction.type === 'edit') {
      setEditingNotice(pendingAction.notice);
      setIsFormOpen(true);
    } else if (pendingAction.type === 'delete') {
      executeDeleteNotice(pendingAction.noticeId);
    }
    setPendingAction(null);
  };

  const executeDeleteNotice = async (noticeId: string | number) => {
    if (window.confirm('이 공지사항을 정말로 삭제하시겠습니까?')) {
      // Local state update
      const updated = notices.filter(n => String(n.id) !== String(noticeId));
      setNotices(updated);
      if (selectedNotice && String(selectedNotice.id) === String(noticeId)) {
        setSelectedNotice(null);
      }

      // Firestore deletion if applicable
      try {
        await deleteDoc(doc(db, 'notices', String(noticeId)));
      } catch (e) {
        console.warn('Firestore notice delete error (handled local):', e);
      }
    }
  };

  const handleSaveNotice = async (noticeData: Omit<NoticeItem, 'id'> & { id?: string | number }) => {
    const docId = noticeData.id ? String(noticeData.id) : `notice-${Date.now()}`;
    const newNotice: NoticeItem = {
      id: docId,
      title: noticeData.title,
      author: noticeData.author,
      date: noticeData.date,
      category: noticeData.category || '전체공지',
      isImportant: noticeData.isImportant,
      content: noticeData.content,
      imageUrl: noticeData.imageUrl,
      images: noticeData.images
    };

    // Update local state
    if (editingNotice) {
      setNotices(prev => prev.map(n => String(n.id) === String(docId) ? newNotice : n));
      if (selectedNotice && String(selectedNotice.id) === String(docId)) {
        setSelectedNotice(newNotice);
      }
    } else {
      setNotices(prev => [newNotice, ...prev]);
    }

    // Update Firestore if available
    try {
      await setDoc(doc(db, 'notices', docId), {
        ...newNotice,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Firestore notice setDoc error (saved locally):', e);
    }
  };

  // Filter notices
  const filteredNotices = notices.filter(n => {
    // Tab filter
    if (selectedTab === '중요공지') {
      if (!n.isImportant) return false;
    } else if (selectedTab !== '전체') {
      if (n.category !== selectedTab) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchAuthor = n.author.toLowerCase().includes(q);
      const matchCategory = (n.category || '').toLowerCase().includes(q);
      return matchTitle || matchContent || matchAuthor || matchCategory;
    }

    return true;
  });

  // Calculate Next / Prev notices for detail view
  const currentIdx = selectedNotice ? notices.findIndex(n => String(n.id) === String(selectedNotice.id)) : -1;
  const prevNotice = currentIdx > 0 ? notices[currentIdx - 1] : null;
  const nextNotice = currentIdx >= 0 && currentIdx < notices.length - 1 ? notices[currentIdx + 1] : null;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* If a Notice is selected, show Detail View like Column Detail! */}
        {selectedNotice ? (
          <NoticeDetail
            notice={selectedNotice}
            onEdit={(notice) => handleProtectedAction({ type: 'edit', notice })}
            onDelete={(id) => handleProtectedAction({ type: 'delete', noticeId: id })}
            onBack={() => setSelectedNotice(null)}
            prevNotice={prevNotice}
            nextNotice={nextNotice}
            onSelectNotice={(notice) => setSelectedNotice(notice)}
          />
        ) : (
          /* Main Notice Board List View */
          <>
            {/* Header Banner */}
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-hive-green/10 text-hive-green border border-hive-green/20 text-xs font-black rounded-full mb-3 uppercase tracking-wider">
                <Bell size={13} />
                HIVE NOTICE BOARD
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                공지사항 & 학술 소식
              </h1>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                호스피탈리티 경영학회 HIVE의 주요 학술 세미나, 연구 칼럼, 신입 회원 모집 및 공식 안내입니다.
              </p>
            </div>

            {/* Controls Bar: Search + Create Button */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-xs border border-slate-200/80 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                {CATEGORY_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                      selectedTab === tab
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search & Write Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
                <div className="relative w-full md:w-64">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="공지 제목, 내용, 작성자 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-hive-green focus:bg-white transition-all font-medium"
                  />
                </div>

                <button
                  onClick={() => handleProtectedAction({ type: 'create' })}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-hive-green hover:bg-hive-green/90 text-white font-extrabold text-xs md:text-sm rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Plus size={16} />
                  <span>새 공지 작성</span>
                </button>
              </div>
            </div>

            {/* Notice Cards List */}
            <div className="space-y-3">
              {filteredNotices.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/80 shadow-xs">
                  <Bell size={40} className="mx-auto mb-3 text-slate-300 stroke-1" />
                  <p className="text-sm font-bold text-slate-600">등록된 공지사항이 없거나 검색 결과가 없습니다.</p>
                  <p className="text-xs text-slate-400 mt-1">다른 검색어나 카테고리 탭을 선택해 보세요.</p>
                  <button 
                    onClick={() => handleProtectedAction({ type: 'create' })}
                    className="mt-5 px-4 py-2 bg-hive-green text-white rounded-xl text-xs font-extrabold hover:bg-hive-green/90 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>첫 공지사항 작성하기</span>
                  </button>
                </div>
              ) : (
                filteredNotices.map((notice) => (
                  <motion.div 
                    key={notice.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedNotice(notice)}
                    className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-hive-green/40 transition-all duration-200 cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start md:items-center gap-4 min-w-0">
                      {/* Notice Cover Thumbnail Image if present */}
                      {(notice.imageUrl || (notice.images && notice.images.length > 0)) ? (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 shrink-0 shadow-2xs relative group-hover:scale-105 transition-transform">
                          <img 
                            src={notice.imageUrl || (notice.images && notice.images[0])} 
                            alt={notice.title} 
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 p-0.5 bg-slate-900/70 text-white rounded-md text-[9px]">
                            <ImageIcon size={10} />
                          </span>
                        </div>
                      ) : (
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/60 font-bold text-xs">
                          <Bell size={20} className="text-slate-400" />
                        </div>
                      )}

                      {/* Notice Title & Excerpt */}
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          {notice.isImportant && (
                            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 shadow-2xs flex items-center gap-1">
                              중요
                            </span>
                          )}
                          <span className="bg-hive-green/10 text-hive-green border border-hive-green/20 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                            {notice.category || '공지사항'}
                          </span>
                        </div>

                        <h3 className="text-slate-900 font-extrabold text-base md:text-lg group-hover:text-hive-green transition-colors line-clamp-1">
                          {notice.title}
                        </h3>

                        <p className="text-slate-500 text-xs md:text-sm line-clamp-1 mt-1 font-medium">
                          {notice.content.replace(/#|\*|`/g, '')}
                        </p>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-4 text-xs text-slate-400 font-mono shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-bold">
                          <Calendar size={13} className="text-slate-400" />
                          {notice.date}
                        </span>
                        <span className="flex items-center gap-1 text-slate-700 font-sans font-bold">
                          <User size={13} className="text-slate-400" />
                          {notice.author}
                        </span>
                      </div>

                      {/* Action buttons on hover/list */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProtectedAction({ type: 'edit', notice });
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="수정"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProtectedAction({ type: 'delete', noticeId: notice.id });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-hive-green group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}

      </div>

      {/* Password Authorization Modal (2405) */}
      <NoticePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handlePasswordSuccess}
        title="관리자 비밀번호 확인"
        subtitle="공지사항 작성/수정/삭제 권한을 확인합니다."
      />

      {/* Write / Edit Notice Modal */}
      <NoticeFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingNotice(null);
        }}
        editingNotice={editingNotice}
        onSave={handleSaveNotice}
      />
    </div>
  );
}
