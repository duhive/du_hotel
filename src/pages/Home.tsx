import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Globe, Users, Target, Zap, ChevronLeft, ChevronRight, Play, Pause, Plus, X, Briefcase, Building2, Clock, MapPin } from 'lucide-react';
import Contact from '../components/Contact';
import { BRAND_STORY } from '../constants';
import { NoticeItem } from '../types';
import NoticeDetail from '../components/NoticeDetail';
import NoticeFormModal from '../components/NoticeFormModal';
import NoticePasswordModal from '../components/NoticePasswordModal';

import aviationHero from '../assets/images/aviation_service_hero_1782037825374.jpg';
import metaverseHero from '../assets/images/metaverse_hotel_hero_1782191831140.jpg';
import cabinServiceAbout from '../assets/images/cabin_service_about_1782193310292.jpg';

export interface NewsItem {
  id: number;
  tag: string;
  category: string;
  title: string;
  date: string;
  image: string;
  content: string;
}

export interface JobItem {
  id: number;
  category: string;
  company: string;
  title: string;
  deadline: string;
  location: string;
  content: string;
}

const INITIAL_NOTICES: NoticeItem[] = [];

const INITIAL_JOBS: JobItem[] = [];

const INITIAL_NEWS: NewsItem[] = [
  {
    id: 4,
    tag: "Curriculum",
    category: "Regular Curriculums",
    title: "호스피탈리티 세미나(2)",
    date: "2026.03.14",
    image: "https://i.ibb.co/4nfnKKkj/Kakao-Talk-20260507-182539464-08.jpg",
    content: `관광 및 호스피탈리티 산업의 다각화된 국외 이슈와 최신 전략적 흐름을 분석하고 연구 발표를 진행했습니다.

주요 연구 분석 주제:
• 자본의 역외 수출 현상과 상생 전략
• 문화유산 자원과 관광수요의 활성화 상관관계
• 일본 '스마도리(スマドリ)' 문화 확산에 따른 주류 시장 분석
• 서비스 직군의 노동 환경이 직무만족과 이직의도에 미치는 영향
• 유가 등 대외 요인 조성이 국제 관광 경제에 주는 피드백`
  },
  {
    id: 5,
    tag: "Ideation",
    category: "Idea Ideation",
    title: "호스피탈리티 세미나(1)",
    date: "2026.04.06",
    image: "https://i.ibb.co/tpGm5dsZ/Kakao-Talk-20260407-184041137-05.jpg",
    content: `지난 4월 6일(월) 16:30, '관심 있는 관광 분야 조사 및 발표'를 주제로 세미나가 진행되었습니다.

각 학회원이 지속 가능한 관광, AI·스마트 관광, 지역 관광, 축제 및 이벤트 관광, 관광 상품 및 서비스 경험 등 다양한 주제에 대해 자유로운 발표를 펼치고 인사이트를 나누었습니다.`
  },
  {
    id: 6,
    tag: "Network",
    category: "Human Network",
    title: "호스피탈리티 경영학회 OT",
    date: "2026.03.30",
    image: "https://i.ibb.co/Mx4Yw4nk/image.png",
    content: `지난 2026년 3월 30일, 많은 학회원분들의 성원 속에서 HIVE 학회 오리엔테이션(OT)이 성공적으로 개최되었습니다.

이번 오리엔테이션을 통해 HIVE의 핵심 가치와 학술 비전은 물론, 앞으로 함께 만들어갈 알차고 유익한 활동 계획들을 활기차게 나누었습니다.`
  }
];

const slides = [
  {
    image: aviationHero,
    uniDept: "DAEGU UNIVERSITY HOSPITALITY MANAGEMENT SOCIETY",
    slogan: "환대와 혁신으로 더 넓은 세상의 가치를 연결하는",
    title: "호스피탈리티",
    subtitle: "DIVISION OF HOSPITALITY",
    linkPath: "/about",
    linkText: "LEARN MORE"
  },
  {
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&q=80&w=2000",
    uniDept: "DAEGU UNIVERSITY HOSPITALITY MANAGEMENT SOCIETY",
    slogan: "지성적 탐구와 혁신으로 차세대 호스피탈리티의 가치를 세우다",
    title: "글로벌 호스피탈리티 리더십",
    subtitle: "ACADEMIC INNOVATION & GLOBAL LEADERSHIP",
    linkPath: "/activities",
    linkText: "VIEW ACTIVITIES"
  },
  {
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=2000",
    uniDept: "DAEGU UNIVERSITY HOSPITALITY MANAGEMENT SOCIETY",
    slogan: "새로운 도약과 연구를 향해 높은 가치를 창출하는",
    title: "차세대 글로벌 호스피탈리티 네트워크",
    subtitle: "NEXT GENERATION HOSPITALITY NETWORK",
    linkPath: "/join",
    linkText: "JOIN US NOW"
  },
  {
    image: "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&q=80&w=2000",
    uniDept: "DAEGU UNIVERSITY HOSPITALITY MANAGEMENT SOCIETY",
    slogan: "품격 높은 감동과 학술적 전문성을 설계하는 커뮤니티",
    title: "최적의 서비스 경험 디자인",
    subtitle: "EXPERIENCE DESIGN & SERVICE STRATEGY",
    linkPath: "/projects",
    linkText: "OUR PROJECTS"
  }
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Notice & News State
  const [notices, setNotices] = useState<NoticeItem[]>(() => {
    const saved = localStorage.getItem('hive_notices');
    if (saved) {
      try {
        const parsed: NoticeItem[] = JSON.parse(saved);
        return parsed.filter(n => n.author !== '김현정');
      } catch (e) {
        return INITIAL_NOTICES;
      }
    }
    return INITIAL_NOTICES;
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('hive_news');
    if (saved) {
      try {
        const parsed: NewsItem[] = JSON.parse(saved);
        if (parsed.some(item => item.id === 1 || item.id === 2 || item.id === 3)) {
          return INITIAL_NEWS;
        }
        return parsed;
      } catch (e) {
        return INITIAL_NEWS;
      }
    }
    return INITIAL_NEWS;
  });

  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Job / Career State
  const [jobs, setJobs] = useState<JobItem[]>(() => {
    const saved = localStorage.getItem('hive_jobs');
    if (saved) {
      try {
        const parsed: JobItem[] = JSON.parse(saved);
        // Filter out initial sample jobs if present
        return parsed.filter(j => j.id !== 1 && j.id !== 2 && j.id !== 3);
      } catch (e) {
        return INITIAL_JOBS;
      }
    }
    return INITIAL_JOBS;
  });
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  useEffect(() => {
    localStorage.setItem('hive_jobs', JSON.stringify(jobs));
  }, [jobs]);

  // Protected Notice actions state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [pendingNoticeAction, setPendingNoticeAction] = useState<
    { type: 'create' } | 
    { type: 'edit'; notice: NoticeItem } | 
    { type: 'delete'; noticeId: string | number } | 
    null
  >(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);

  useEffect(() => {
    localStorage.setItem('hive_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('hive_news', JSON.stringify(news));
  }, [news]);

  const handleProtectedNoticeAction = (action: 
    { type: 'create' } | 
    { type: 'edit'; notice: NoticeItem } | 
    { type: 'delete'; noticeId: string | number }
  ) => {
    setPendingNoticeAction(action);
    setPasswordModalOpen(true);
  };

  const handlePasswordSuccess = () => {
    if (!pendingNoticeAction) return;
    if (pendingNoticeAction.type === 'create') {
      setEditingNotice(null);
      setIsFormOpen(true);
    } else if (pendingNoticeAction.type === 'edit') {
      setEditingNotice(pendingNoticeAction.notice);
      setIsFormOpen(true);
    } else if (pendingNoticeAction.type === 'delete') {
      if (window.confirm('이 공지사항을 정말로 삭제하시겠습니까?')) {
        setNotices(prev => prev.filter(n => String(n.id) !== String(pendingNoticeAction.noticeId)));
        if (selectedNotice && String(selectedNotice.id) === String(pendingNoticeAction.noticeId)) {
          setSelectedNotice(null);
        }
      }
    }
    setPendingNoticeAction(null);
  };

  const handleSaveNotice = (noticeData: Omit<NoticeItem, 'id'> & { id?: string | number }) => {
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

    if (editingNotice) {
      setNotices(prev => prev.map(n => String(n.id) === String(docId) ? newNotice : n));
      if (selectedNotice && String(selectedNotice.id) === String(docId)) {
        setSelectedNotice(newNotice);
      }
    } else {
      setNotices(prev => [newNotice, ...prev]);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="pt-20 bg-white">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[500px] flex items-center overflow-hidden bg-slate-950">
        {/* Animated Slide Background */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <img 
                src={slides[currentSlide].image} 
                alt={slides[currentSlide].title} 
                className="w-full h-full object-cover object-center opacity-65 select-none"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
          {/* Green / Slate Overlay matching the green brand theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-hive-green/20 to-slate-950/70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/25 to-slate-950/80" />
          <div className="absolute inset-0 bg-hive-green/10 mix-blend-color pointer-events-none" />
        </div>

        {/* Technical/Cyber Circle Coordinate Overlay inspired by reference screenshot */}
        <div className="absolute left-4 md:left-24 top-1/2 -translate-y-1/2 w-[300px] md:w-[550px] h-[300px] md:h-[550px] pointer-events-none opacity-30 z-10">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-hive-light-green/30 animate-[spin_100s_linear_infinite]">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.15" strokeDasharray="1 3" />
            <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.1" strokeDasharray="3 1" />
            <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="0.3" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.1" />
            <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.1" />
            <path d="M 20 50 A 30 30 0 0 1 80 50" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 2" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center animate-[pulse_4s_ease-in-out_infinite]">
            <div className="w-48 h-48 rounded-full border border-hive-green/20 blur-[1px]"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-4xl text-left font-sans">
            {/* Slogan */}
            <motion.p
              key={`slogan-${currentSlide}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-base md:text-xl text-emerald-100/95 font-medium mb-4 tracking-wide leading-relaxed"
            >
              {slides[currentSlide].slogan}
            </motion.p>
            
            {/* Title - Fixed to 호스피탈리티 경영학회 as requested */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight select-none">
              <span className="tracking-[0.08em] mr-2">호스피탈리티</span> 경영학회
            </h1>

            {/* Subtitle - Fixed to Hospitality Management Society as requested */}
            <p className="text-xs sm:text-sm md:text-base font-bold text-emerald-200/50 tracking-[0.4em] mb-10 select-none uppercase font-mono">
              Hospitality Management Society
            </p>

            {/* Action Link button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link 
                to={slides[currentSlide].linkPath} 
                className="inline-flex items-center gap-3 px-8 py-3.5 border border-white/20 hover:border-white text-white/95 hover:text-white font-mono text-sm tracking-[0.2em] rounded-sm bg-white/5 backdrop-blur-sm hover:bg-white hover:text-slate-950 transition-all duration-300 shadow-lg"
              >
                {slides[currentSlide].linkText}
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Minimalist Slide Navigation & Status Panel matching exact layout (< 1 / 4 > ||) */}
        <div className="absolute bottom-8 right-4 sm:right-12 lg:right-24 z-30 flex items-center bg-slate-950/85 md:bg-slate-900/60 backdrop-blur-md px-6 py-3.5 rounded-full border border-white/10 text-white shadow-xl">
          {/* Previous Button */}
          <button 
            onClick={handlePrev}
            className="p-1 hover:text-hive-light-green active:scale-95 transition-all mr-3 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Pagination Counter: current / total */}
          <span className="font-mono text-xs tracking-wider select-none font-bold mr-4">
            {String(currentSlide + 1).padStart(2, '0')} <span className="text-white/40 mx-1">/</span> {String(slides.length).padStart(2, '0')}
          </span>

          {/* Next Button */}
          <button 
            onClick={handleNext}
            className="p-1 hover:text-hive-light-green active:scale-95 transition-all mr-5 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight size={18} />
          </button>

          {/* Divider line */}
          <span className="h-4 w-[1px] bg-white/15 dark:bg-white/15 mr-4" />

          {/* Autoplay Play/Pause */}
          <button 
            onClick={togglePlay}
            className="p-1 hover:text-hive-light-green active:scale-95 transition-all cursor-pointer"
            aria-label={isPlaying ? "Pause autocomplete" : "Play autocomplete"}
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>
        </div>
      </section>

      {/* Notice & News Dashboard Section */}
      <section className="py-12 md:py-16 bg-slate-100/70 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* Left Column: NOTICE Card & CAREER Card */}
            <div className="flex flex-col gap-6 justify-between">
              
              {/* NOTICE Card (Reduced Height) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 font-sans tracking-tight">NOTICE</h2>
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200/50">
                        공지사항
                      </span>
                    </div>
                    <button 
                      onClick={() => handleProtectedNoticeAction({ type: 'create' })}
                      className="flex items-center gap-1.5 text-slate-600 hover:text-hive-green text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="text-xs">+ 작성</span>
                      <Plus size={13} className="text-slate-500" />
                    </button>
                  </div>

                  {/* Notices List (Compact) */}
                  <div className="divide-y divide-slate-100 min-h-[120px] flex flex-col justify-start">
                    {notices.length === 0 ? (
                      <div className="my-auto py-8 text-center text-slate-400 text-xs md:text-sm">
                        등록된 공지사항이 없습니다.
                      </div>
                    ) : (
                      notices.slice(0, 3).map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedNotice(item)}
                          className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            {item.isImportant && (
                              <span className="bg-rose-50 text-rose-500 border border-rose-200/60 text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0">
                                중요
                              </span>
                            )}
                            <span className="text-slate-800 font-medium text-xs md:text-sm group-hover:text-hive-green transition-colors truncate">
                              {item.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-[11px] md:text-xs text-slate-400 font-mono">
                            <span>{item.date}</span>
                            <span className="text-slate-700 font-medium font-sans text-right">{item.author}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Notice Footer */}
                <div className="pt-3 mt-2 border-t border-slate-100 text-center">
                  <Link 
                    to="/notices"
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-bold text-xs transition-colors cursor-pointer group"
                  >
                    <span>전체 공지사항 목록보기</span>
                    <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* CAREER / JOB INFO Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 flex flex-col justify-between flex-1">
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <Briefcase size={18} />
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 font-sans tracking-tight">CAREER</h2>
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-200/60">
                        취업 정보
                      </span>
                    </div>
                  </div>

                  {/* Jobs List */}
                  <div className="space-y-2.5 my-1 min-h-[120px] flex flex-col justify-center">
                    {jobs.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs md:text-sm">
                        등록된 취업 정보가 없습니다.
                      </div>
                    ) : (
                      jobs.map((job) => (
                        <div 
                          key={job.id}
                          onClick={() => setSelectedJob(job)}
                          className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded shrink-0">
                                {job.category}
                              </span>
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {job.company}
                              </span>
                            </div>
                            <span className="flex items-center gap-1 text-[10px] md:text-[11px] font-mono text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full font-semibold shrink-0">
                              <Clock size={10} />
                              ~{job.deadline}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {job.title}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin size={11} /> {job.location}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* PHOTO Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-5 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-900 font-sans tracking-tight">PHOTO</h2>
                    <span className="px-3 py-0.5 bg-hive-green/10 text-hive-green rounded-full text-xs font-bold border border-hive-green/20">
                      포토 갤러리
                    </span>
                  </div>
                </div>

                {/* News Grid (3 Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 py-1 min-h-[300px]">
                  {news.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedNews(item)}
                      className="bg-white border border-slate-200/70 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                          {item.tag}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-hive-green font-bold text-xs mb-1 truncate">
                            {item.category}
                          </h4>
                          <p className="text-slate-900 font-bold text-xs md:text-[13px] leading-snug line-clamp-2 group-hover:text-hive-green transition-colors">
                            {item.title}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>{item.date}</span>
                          <span className="text-hive-green font-medium group-hover:underline flex items-center gap-0.5">
                            상세 &gt;
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* News Footer */}
              <div className="pt-6 mt-4 border-t border-slate-100 text-center">
                <Link 
                  to="/photo"
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold text-xs md:text-sm transition-colors cursor-pointer group"
                >
                  <span>학회 포토 갤러리 가기</span>
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Notice Detail Modal / Overlay */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs p-4 md:p-8 animate-fadeIn">
          <NoticeDetail
            notice={selectedNotice}
            onEdit={(notice) => handleProtectedNoticeAction({ type: 'edit', notice })}
            onDelete={(noticeId) => handleProtectedNoticeAction({ type: 'delete', noticeId })}
            onBack={() => setSelectedNotice(null)}
          />
        </div>
      )}

      {/* News / Photo Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-slate-100">
            <button 
              onClick={() => setSelectedNews(null)}
              className="absolute top-3 right-3 z-10 p-1.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="relative aspect-video w-full bg-slate-100">
              <img 
                src={selectedNews.image} 
                alt={selectedNews.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-slate-900/85 text-white text-xs font-bold px-2.5 py-1 rounded shadow-xs">
                {selectedNews.tag}
              </span>
            </div>

            <div className="p-6">
              <div className="text-hive-green font-bold text-xs mb-1">
                {selectedNews.category}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug">
                {selectedNews.title}
              </h3>
              <div className="text-xs font-mono text-slate-400 mb-4">
                발행일: {selectedNews.date}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-line leading-relaxed mb-6 border border-slate-100 min-h-[100px]">
                {selectedNews.content}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <button 
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-50 text-blue-600 font-bold text-xs px-2.5 py-0.5 rounded-full border border-blue-200/60">
                {selectedJob.category}
              </span>
              <span className="text-slate-500 font-bold text-xs">{selectedJob.company}</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
              {selectedJob.title}
            </h3>

            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100 font-mono">
              <span className="flex items-center gap-1 text-rose-500 font-semibold">
                <Clock size={12} /> 마감일: {selectedJob.deadline}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} /> 근무지: {selectedJob.location}
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-xs md:text-sm text-slate-700 space-y-2 whitespace-pre-line leading-relaxed mb-6 border border-slate-100 min-h-[100px] max-h-[250px] overflow-y-auto">
              {selectedJob.content}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Protected Notice Password Verification Modal */}
      <NoticePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setPendingNoticeAction(null);
        }}
        onSuccess={handlePasswordSuccess}
        title="관리자 비밀번호 확인"
        subtitle="공지사항 작성/수정/삭제 권한을 확인합니다."
      />

      {/* Notice Form Modal */}
      <NoticeFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingNotice(null);
        }}
        editingNotice={editingNotice}
        onSave={handleSaveNotice}
      />

      {/* Contact Section removed as requested */}
    </div>
  );
};

export default Home;
