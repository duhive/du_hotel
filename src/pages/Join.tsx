import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SectionHeader from '../components/SectionHeader';
import { FAQS } from '../constants';
import { Send, ChevronDown, ChevronUp, Zap, Target, ArrowLeft, CheckCircle2, RotateCcw, AlertCircle, Upload, Image as ImageIcon, X, Lock, Search, Check } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ApplicationAdminModal } from '../components/ApplicationAdminModal';

// Operation types for Firestore security requirements
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Global Firestore error handler with structured logging
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const INTEREST_OPTIONS = [
  '관광 / 호스피탈리티',
  '호텔 / 외식 / 조리',
  '무역학 / 국제통상',
  '미디어 / 언론 / 방송',
  '마케팅 / 브랜딩 / PR',
  '경영학 / 회계 / 재무',
  '핀테크 / 금융 / 투자',
  '반도체 / 디스플레이',
  'AI / 빅데이터 / IT',
  '디자인 / UX·UI / 콘텐츠',
  '행정학 / 법학 / 공공정책',
  '항공 / 서비스 / MICE',
  '언어 / 통번역 / 외국어',
  '심리학 / 소비자학',
  '바이오 / 헬스케어 / 의학',
  '스포츠 / 체육 / 레저',
  '환경 / 에너지 / ESG',
  '문화예술 / 엔터테인먼트',
  '유통 / 물류 / 커머스',
  '창업 / 스타트업',
  '기타'
];

const CHARACTER_PRESETS = [
  { id: 'default', name: '기본 캐릭터', url: 'https://i.ibb.co/TGvX4D7/28.png' }
];

// Canvas-based image compressor to safe base64 format (< 100KB typical)
const compressAndGetBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64Url = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG
          resolve(base64Url);
        } else {
          resolve(img.src);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const Join = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const [isApplying, setIsApplying] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submissionId, setSubmissionId] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isDragging, setIsDragging] = React.useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    studentId: '',
    motivation: '',
    strengths: '',
    activityProposal: '',
    interestTrack: '학술 및 연구 정보',
    photo: '' // base64 representation
  });

  const [selectedToggles, setSelectedToggles] = React.useState<string[]>(['관광 / 호스피탈리티']);
  const [customInterest, setCustomInterest] = React.useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [photoMode, setPhotoMode] = React.useState<'file' | 'character'>('file');
  const [selectedCharacter, setSelectedCharacter] = React.useState<string>('https://i.ibb.co/TGvX4D7/28.png');
  const [isAgreed, setIsAgreed] = React.useState<boolean>(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleInterestOption = (option: string) => {
    setSelectedToggles(prev => {
      if (prev.includes(option)) {
        const filtered = prev.filter(item => item !== option);
        return filtered;
      } else {
        return [...prev, option];
      }
    });
  };

  const getFormattedInterestTrack = () => {
    const list: string[] = [];
    selectedToggles.forEach(opt => {
      if (opt === '기타') {
        if (customInterest.trim()) {
          list.push(`기타: ${customInterest.trim()}`);
        } else {
          list.push('기타');
        }
      } else {
        list.push(opt);
      }
    });
    return list.length > 0 ? list.join(', ') : '미지정';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const selectTrack = (trackName: string) => {
    setFormData(prev => ({
      ...prev,
      interestTrack: trackName
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMessage('이미지 파일지만 업로드할 수 있습니다.');
        return;
      }
      try {
        const base64 = await compressAndGetBase64(file);
        setFormData(prev => ({
          ...prev,
          photo: base64
        }));
        setErrorMessage('');
      } catch (err) {
        setErrorMessage('이미지를 처리하는 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMessage('이미지 파일지만 업로드할 수 있습니다.');
        return;
      }
      try {
        const base64 = await compressAndGetBase64(file);
        setFormData(prev => ({
          ...prev,
          photo: base64
        }));
        setErrorMessage('');
      } catch (err) {
        setErrorMessage('이미지를 처리하는 중 오류가 발생했습니다.');
      }
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validation rules
  const isFormValid = () => {
    const { name, email, phone, department, studentId, motivation, strengths } = formData;
    const hasToggles = selectedToggles.length > 0;
    const isCustomValid = !selectedToggles.includes('기타') || selectedToggles.length > 1 || customInterest.trim().length > 0;
    return (
      name.trim().length >= 2 && name.trim().length <= 50 &&
      email.trim().includes('@') && email.trim().length >= 5 && email.trim().length <= 100 &&
      phone.trim().length >= 8 && phone.trim().length <= 20 &&
      department.trim().length >= 2 && department.trim().length <= 50 &&
      studentId.trim().length >= 4 && studentId.trim().length <= 20 &&
      motivation.trim().length >= 10 && motivation.trim().length <= 2000 &&
      strengths.trim().length >= 10 && strengths.trim().length <= 2000 &&
      hasToggles &&
      isCustomValid &&
      isAgreed
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage('성함을 2자 이상 정확히 입력해 주세요.');
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('올바른 이메일 주소를 입력해 주세요. (예: example@daegu.ac.kr)');
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setErrorMessage('연락처를 정확히 입력해 주세요.');
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }
    if (!formData.department.trim() || formData.department.trim().length < 2) {
      setErrorMessage('소속 학과를 입력해 주세요.');
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }
    if (!formData.studentId.trim() || formData.studentId.trim().length < 4) {
      setErrorMessage('학번을 정확히 입력해 주세요.');
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }
    if (selectedToggles.length === 0) {
      setErrorMessage('관심 분야를 최소 하나 이상 선택해 주세요.');
      window.scrollTo({ top: 450, behavior: 'smooth' });
      return;
    }
    if (selectedToggles.includes('기타') && customInterest.trim().length === 0 && selectedToggles.length === 1) {
      setErrorMessage('기타 관심 분야를 직접 입력해 주세요.');
      window.scrollTo({ top: 450, behavior: 'smooth' });
      return;
    }
    if (!formData.motivation.trim() || formData.motivation.trim().length < 10) {
      setErrorMessage('지원 동기를 최소 10자 이상 입력해 주세요.');
      return;
    }
    if (!formData.strengths.trim() || formData.strengths.trim().length < 10) {
      setErrorMessage('본인의 강점 및 관련 경험을 최소 10자 이상 입력해 주세요.');
      return;
    }
    if (!isAgreed) {
      setErrorMessage('개인정보 수집·이용 및 입회 지원서 작성 내용 확인 동의란에 체크해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalTrack = getFormattedInterestTrack();
      const photoToSubmit = formData.photo || selectedCharacter || CHARACTER_PRESETS[0].url;

      // Create random cryptographic-style 12-char application code for the user
      const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randomCode = 'HIVE-';
      for (let i = 0; i < 6; i++) {
        randomCode += codeChars.charAt(Math.floor(Math.random() * codeChars.length));
      }

      // Prepare target path in Firestore matching our rules spec
      const collectionPath = 'applications';
      const docRef = doc(collection(db, collectionPath), randomCode);

      // Save application document
      await setDoc(docRef, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        studentId: formData.studentId.trim(),
        motivation: formData.motivation.trim(),
        strengths: formData.strengths.trim(),
        activityProposal: formData.activityProposal.trim(),
        interestTrack: finalTrack,
        photo: photoToSubmit,
        submittedAt: serverTimestamp() // strictly checked as request.time on rules
      });

      // Local storage backup for instant sync
      try {
        const localData = {
          id: randomCode,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          department: formData.department.trim(),
          studentId: formData.studentId.trim(),
          motivation: formData.motivation.trim(),
          strengths: formData.strengths.trim(),
          activityProposal: formData.activityProposal.trim(),
          interestTrack: finalTrack,
          photo: photoToSubmit,
          createdAtStr: new Date().toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        };
        const existing = localStorage.getItem('hive_applications');
        const list = existing ? JSON.parse(existing) : [];
        list.unshift(localData);
        localStorage.setItem('hive_applications', JSON.stringify(list));
      } catch (e) {
        console.error('Failed to save to local storage backup', e);
      }

      setSubmissionId(randomCode);
      setSubmitSuccess(true);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, `applications/${formData.studentId}`);
      } catch (logErr) {
        // Printed in dev console
      }
      setErrorMessage('지원서 제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFormState = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      studentId: '',
      motivation: '',
      strengths: '',
      activityProposal: '',
      interestTrack: '학술 및 연구 정보',
      photo: ''
    });
    setSubmitSuccess(false);
    setSubmissionId('');
    setErrorMessage('');
    setIsApplying(false);
  };

  return (
    <div className="pt-32 pb-24 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Copy recruitment info */}
          <div className="order-2 lg:order-1">
            <SectionHeader title="Become a Future Leader" subtitle="Recruitment 2026" />
            
            <div className="prose prose-navy max-w-none mb-12">
              <h3 className="text-2xl font-serif font-bold mb-4 text-navy-900">
                우리는 단순한 '스펙'을 넘어선 '성장'을 찾습니다.
              </h3>
              <p className="text-navy-900/70 leading-relaxed mb-6 font-sans">
                HIVE는 Hospitality 산업의 미래를 설계할 전략가들을 모집합니다. 
                우리는 호텔관광경영학부의 학문적 깊이를 바탕으로 다양한 관점에서 문제를 바라보며 
                실질적인 솔루션을 도출할 수 있는 실행력을 가진 인재를 기다립니다.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                <div className="p-6 bg-white border border-navy-900/5 shadow-sm rounded-xl">
                  <Zap size={24} className="text-hive-light-green mb-4" />
                  <h4 className="font-bold mb-2 text-navy-900">Strategic Mindset</h4>
                  <p className="text-xs text-navy-900/60 font-sans leading-relaxed">현상을 분석하고 논리적인 대안을 제시하는 사고방식</p>
                </div>
                <div className="p-6 bg-white border border-navy-900/5 shadow-sm rounded-xl">
                  <Target size={24} className="text-hive-light-green mb-4" />
                  <h4 className="font-bold mb-2 text-navy-900">Execution Power</h4>
                  <p className="text-xs text-navy-900/60 font-sans leading-relaxed">아이디어를 현실로 바꾸는 강력한 실행력과 책임감</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-navy-900/40 font-bold mb-4">Recruitment Process</h4>
              {[
                { step: "01", title: "Application Submission", desc: "서류 전형 및 자기소개 포트폴리오 확인" },
                { step: "02", title: "Strategic Interview", desc: "면접 (Zoom 진행 또는 상황에 따라 생략 예정)" },
                { step: "03", title: "Orientation", desc: "오리엔테이션" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center p-4 bg-navy-900/5 border-l-2 border-hive-green rounded-r-xl">
                  <span className="text-xl font-serif font-bold mr-6 text-hive-green/30">{item.step}</span>
                  <div>
                    <h5 className="font-bold text-sm text-navy-900">{item.title}</h5>
                    <p className="text-xs text-navy-900/60 font-sans">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Toggle between Application Form Workroom & FAQ Panel */}
          <div className="order-1 lg:order-2 space-y-12">
            <AnimatePresence mode="wait">
              {!isApplying ? (
                // Step 0: Recruitment Intro Card
                <motion.div
                  key="intro-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-hive-green p-8 md:p-12 text-white shadow-xl rounded-2xl relative overflow-hidden"
                >
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none blur-xl" />
                  <h3 className="text-2xl font-serif mb-6 leading-tight">Apply Now</h3>
                  <p className="text-white/80 text-sm mb-10 leading-relaxed font-sans">
                    호스피탈리티 경영학회 HIVE 2기/3기 모집에 지원하시겠습니까? <br/>
                    아래 버튼을 통하여 본인 사진이나 대표 이미지가 포함된 상세 자기소개 지원서를 간편하게 온라인 제출할 수 있습니다.
                  </p>
                  <button
                    onClick={() => setIsApplying(true)}
                    className="w-full py-4 bg-white text-hive-green font-bold uppercase tracking-widest hover:bg-white/90 active:scale-[0.99] transition-all flex items-center justify-center rounded-xl shadow-md cursor-pointer"
                  >
                    Application Form <Send size={18} className="ml-2" />
                  </button>
                  <p className="mt-4 text-[10px] text-center text-white/50 uppercase tracking-widest font-mono">
                    Deadline: 2026.03.31 23:59
                  </p>

                  <div className="mt-6 pt-4 border-t border-white/15 text-center">
                    <button
                      onClick={() => setIsAdminModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white font-medium underline underline-offset-4 cursor-pointer transition-colors"
                    >
                      <Lock size={12} /> 지원서 현황 조회
                    </button>
                  </div>
                </motion.div>
              ) : submitSuccess ? (
                // Success Badge Card
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-8 md:p-12 border border-blue-100 shadow-xl rounded-2xl text-center"
                >
                  <div className="w-16 h-16 bg-blue-50 text-hive-green rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={36} className="text-hive-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy-900 mb-2">지원서 제출 완료!</h3>
                  <p className="text-sm text-navy-900/60 font-sans mb-8 leading-relaxed">
                    학회 자기소개 지원서가 정상적으로 데이터베이스에 제출되었습니다.<br/>
                    서류 전형 결과는 기재해 주신 연락처 및 이메일로 개별 안내됩니다.
                  </p>
                  
                  <div className="bg-ivory py-4 px-6 rounded-xl border border-navy-900/10 mb-8 max-w-sm mx-auto">
                    <p className="text-[10px] text-navy-900/40 uppercase tracking-wider font-mono mb-1">지원서 접수번호</p>
                    <p className="text-xl font-mono font-bold text-hive-green select-all">{submissionId}</p>
                  </div>
                  
                  <button
                    onClick={resetFormState}
                    className="inline-flex items-center justify-center px-6 py-3 bg-hive-green text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    돌아가기 <RotateCcw size={14} className="ml-2" />
                  </button>
                </motion.div>
              ) : (
                // Beautiful Forms Worksheet
                <motion.div
                  key="form-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-white p-6 md:p-8 border border-navy-900/10 shadow-xl rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-navy-900/10">
                    <button
                      onClick={() => setIsApplying(false)}
                      className="inline-flex items-center text-xs text-navy-900/40 hover:text-navy-900 tracking-wider font-bold uppercase transition-colors"
                    >
                      <ArrowLeft size={16} className="mr-1" /> Back
                    </button>
                    <span className="text-[10px] font-mono font-bold bg-hive-green/10 text-hive-green px-3 py-1 rounded-full uppercase">
                      자기소개 온라인 지원서
                    </span>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    {errorMessage && (
                      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3">
                        <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 leading-relaxed font-sans">{errorMessage}</p>
                      </div>
                    )}

                    {/* Image Upload / Character Selection section */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <label className="block text-xs font-bold text-navy-900 uppercase tracking-wide">
                          자기소개 프로필 / 대표 이미지 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex bg-navy-900/5 p-1 rounded-xl border border-navy-900/10 gap-1 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoMode('file');
                              if (formData.photo.startsWith('https://')) {
                                setFormData(prev => ({ ...prev, photo: '' }));
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              photoMode === 'file'
                                ? 'bg-white text-navy-900 shadow-2xs font-extrabold'
                                : 'text-navy-900/50 hover:text-navy-900'
                            }`}
                          >
                            직접 사진 업로드
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoMode('character');
                              setFormData(prev => ({ ...prev, photo: selectedCharacter }));
                            }}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              photoMode === 'character'
                                ? 'bg-hive-green text-white shadow-2xs font-extrabold'
                                : 'text-navy-900/50 hover:text-navy-900'
                            }`}
                          >
                            기본 캐릭터 선택
                          </button>
                        </div>
                      </div>

                      {photoMode === 'file' ? (
                        !formData.photo || formData.photo.startsWith('https://') ? (
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                              isDragging 
                                ? 'border-hive-green bg-hive-green/5' 
                                : 'border-navy-900/10 hover:border-navy-900/30 hover:bg-navy-900/5'
                            }`}
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <Upload className="mx-auto w-7 h-7 text-navy-900/40 mb-2" />
                            <p className="text-xs font-sans text-navy-900/80 font-semibold mb-0.5">컴퓨터에서 본인 사진 선택 또는 드래그</p>
                            <p className="text-[11px] text-navy-900/40 font-sans">지원자 확인용 증명사진 혹은 상반신 프로필 (PNG, JPG)</p>
                          </div>
                        ) : (
                          <div className="relative rounded-xl overflow-hidden border border-navy-900/10 bg-navy-900/5 p-3 flex items-center gap-4">
                            <img 
                              src={formData.photo} 
                              alt="Applicant portrait" 
                              className="w-16 h-16 object-cover rounded-lg border border-navy-900/20"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1">
                              <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 size={12} /> 이미지 업로드 완료
                              </p>
                              <p className="text-[10px] text-navy-900/40 mt-0.5 font-sans">데이터베이스 저장용 최적화 압축 적용됨</p>
                            </div>
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="p-2 bg-navy-900/10 hover:bg-red-500 hover:text-white rounded-full transition-all cursor-pointer text-navy-900/60"
                              title="사진 제거"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="bg-ivory/80 border border-hive-green/30 rounded-2xl p-4 animate-fadeIn">
                          <p className="text-xs font-bold text-navy-900 mb-3 flex items-center justify-between">
                            <span>기본 캐릭터 아바타 선택</span>
                            <span className="text-[10px] text-hive-green font-semibold bg-hive-green/10 px-2 py-0.5 rounded-full">사진 미소지 지원자용</span>
                          </p>
                          <div className="flex items-center gap-3">
                            {CHARACTER_PRESETS.map((char) => {
                              const isSelected = formData.photo === char.url;
                              return (
                                <button
                                  key={char.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCharacter(char.url);
                                    setFormData(prev => ({ ...prev, photo: char.url }));
                                  }}
                                  className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all w-full max-w-xs ${
                                    isSelected
                                      ? 'bg-white border-hive-green shadow-md ring-2 ring-hive-green/30'
                                      : 'bg-white/60 border-navy-900/10 hover:border-navy-900/30'
                                  }`}
                                >
                                  <img
                                    src={char.url}
                                    alt={char.name}
                                    className="w-12 h-12 rounded-full border border-slate-200 object-cover bg-white shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="text-left flex-1">
                                    <p className={`text-xs font-bold ${isSelected ? 'text-hive-green' : 'text-navy-900/80'}`}>
                                      {char.name}
                                    </p>
                                    <p className="text-[10px] text-navy-900/50 font-sans">
                                      HIVE 학회 공식 기본 캐릭터 프로필
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <span className="text-[10px] bg-hive-green text-white font-bold px-2 py-1 rounded-full shrink-0">
                                      선택됨
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Photo Usage Disclosure Notice as requested */}
                      <p className="text-[11px] text-navy-900/60 mt-2.5 font-sans leading-relaxed flex items-start gap-1 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/20">
                        <span className="text-hive-green font-bold shrink-0">*</span>
                        <span>본 사진은 향후 학회 공식 홈페이지 멤버 소개 및 개인 포트폴리오 관리를 위해 사용되는 사진으로, 해당 목적 이외의 용도로는 절대 사용되거나 외부에 제공되지 않습니다.</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-bold text-navy-900 mb-2 uppercase tracking-wide">
                          이름 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          maxLength={50}
                          placeholder="홍길동"
                          className="w-full bg-ivory border border-navy-900/10 focus:border-hive-green focus:outline-none rounded-xl px-4 py-3 text-sm font-sans transition-all"
                        />
                      </div>

                      {/* Student ID */}
                      <div>
                        <label className="block text-xs font-bold text-navy-900 mb-2 uppercase tracking-wide">
                          학번 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          required
                          maxLength={20}
                          placeholder="202612345"
                          className="w-full bg-ivory border border-navy-900/10 focus:border-hive-green focus:outline-none rounded-xl px-4 py-3 text-sm font-sans transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Department */}
                      <div>
                        <label className="block text-xs font-bold text-navy-900 mb-2 uppercase tracking-wide">
                          학과 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          required
                          maxLength={50}
                          placeholder="호텔외식관광학과"
                          className="w-full bg-ivory border border-navy-900/10 focus:border-hive-green focus:outline-none rounded-xl px-4 py-3 text-sm font-sans transition-all"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-bold text-navy-900 mb-2 uppercase tracking-wide">
                          연락처 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          maxLength={20}
                          placeholder="010-1234-5678"
                          className="w-full bg-ivory border border-navy-900/10 focus:border-hive-green focus:outline-none rounded-xl px-4 py-3 text-sm font-sans transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-2 uppercase tracking-wide">
                        이메일 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        maxLength={100}
                        placeholder="example@gmail.com"
                        className="w-full bg-ivory border border-navy-900/10 focus:border-hive-green focus:outline-none rounded-xl px-4 py-3 text-sm font-sans transition-all"
                      />
                    </div>

                    {/* Scrollable Dropdown Selector for Interest Tracks */}
                    <div className="relative" ref={dropdownRef}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-navy-900 uppercase tracking-wide">
                          관심 분야 (드롭다운 목록 선택, 복수 선택 가능) <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-navy-900/50 font-sans">
                          {selectedToggles.length}개 선택됨
                        </span>
                      </div>

                      {/* Select Trigger Box */}
                      <div
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full bg-ivory border border-navy-900/15 hover:border-navy-900/40 focus:border-hive-green rounded-xl p-3 text-sm font-sans cursor-pointer transition-all flex items-center justify-between gap-2 min-h-[46px] shadow-2xs"
                      >
                        <div className="flex flex-wrap gap-1.5 flex-1 items-center min-w-0">
                          {selectedToggles.length === 0 ? (
                            <span className="text-navy-900/40 text-xs">관심 분야를 클릭하여 목록에서 선택해 주세요...</span>
                          ) : (
                            selectedToggles.map(item => (
                              <span
                                key={item}
                                className="inline-flex items-center gap-1 bg-hive-green text-white text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
                              >
                                {item}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleInterestOption(item);
                                  }}
                                  className="hover:bg-white/20 rounded p-0.5 cursor-pointer"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                        <div className="text-navy-900/40 shrink-0 ml-1">
                          {isDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>

                      {/* Dropdown Scrollable Menu */}
                      {isDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 animate-fadeIn space-y-2">
                          {/* Search Input inside Dropdown */}
                          <div className="relative px-1 pt-1">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="무역학, 미디어, 핀테크, 반도체 등 검색..."
                              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-hive-green font-sans"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* Options Scrollable List */}
                          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {INTEREST_OPTIONS.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                              <div className="py-4 text-center text-xs text-slate-400 font-sans">
                                검색 결과가 없습니다.
                              </div>
                            ) : (
                              INTEREST_OPTIONS.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase())).map(option => {
                                const isSelected = selectedToggles.includes(option);
                                return (
                                  <div
                                    key={option}
                                    onClick={() => toggleInterestOption(option)}
                                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                                      isSelected
                                        ? 'bg-hive-green/10 text-hive-green font-bold'
                                        : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                  >
                                    <span>{option}</span>
                                    {isSelected ? (
                                      <div className="w-5 h-5 bg-hive-green text-white rounded-md flex items-center justify-center shrink-0">
                                        <Check size={12} />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 border border-slate-300 rounded-md shrink-0" />
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {/* Custom Input when '기타' is selected */}
                      {selectedToggles.includes('기타') && (
                        <div className="animate-fadeIn mt-3 p-3 bg-ivory/80 rounded-2xl border border-hive-green/40">
                          <label className="block text-[11px] font-bold text-navy-900 mb-1.5">
                            기타 관심 분야 직접 입력
                          </label>
                          <input
                            type="text"
                            value={customInterest}
                            onChange={(e) => setCustomInterest(e.target.value)}
                            placeholder="예: 바이오, 우주항공, 패션, 게임, 에너지 등 관심 분야 입력"
                            maxLength={50}
                            className="w-full bg-white border border-navy-900/15 focus:border-hive-green focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-sans transition-all"
                          />
                        </div>
                      )}
                    </div>

                    {/* Motivation Textarea with Interactive Counts */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                          지원 동기 <span className="text-red-500">* (최소 10자)</span>
                        </label>
                        <span className={`text-[10px] font-mono ${formData.motivation.length > 2000 ? 'text-red-500' : 'text-navy-900/40'}`}>
                          {formData.motivation.length.toLocaleString()} / 2,000자
                        </span>
                      </div>
                      <textarea
                        name="motivation"
                        value={formData.motivation}
                        onChange={handleInputChange}
                        required
                        minLength={10}
                        maxLength={2000}
                        rows={5}
                        placeholder="호스피탈리티 경영학회 HIVE에 지원하게 된 솔직한 동기를 기술해 주세요."
                        className="w-full bg-ivory border border-navy-900/10 focus:border-hive-green focus:outline-none rounded-xl p-4 text-sm font-sans resize-none transition-all"
                      />
                    </div>

                    {/* Strengths Textarea with Interactive Counts */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                          본인의 강점 및 관련 경험 <span className="text-red-500">* (최소 10자)</span>
                        </label>
                        <span className={`text-[10px] font-mono ${formData.strengths.length > 2000 ? 'text-red-500' : 'text-navy-900/40'}`}>
                          {formData.strengths.length.toLocaleString()} / 2,000자
                        </span>
                      </div>
                      <textarea
                        name="strengths"
                        value={formData.strengths}
                        onChange={handleInputChange}
                        required
                        minLength={10}
                        maxLength={2000}
                        rows={5}
                        placeholder="관심 분야와 관련하여 본인의 강점과 기획/소통/활동 등 성취한 과거 경험을 작성해 주세요."
                        className="w-full bg-ivory border border-navy-900/10 focus:border-hive-green focus:outline-none rounded-xl p-4 text-sm font-sans resize-none transition-all"
                      />
                    </div>

                    {/* Activity Proposal Textarea */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                          희망 학회 활동 및 프로젝트 아이디어 제안 <span className="text-navy-900/40 font-normal">(자유 기재)</span>
                        </label>
                        <span className={`text-[10px] font-mono ${formData.activityProposal.length > 2000 ? 'text-red-500' : 'text-navy-900/40'}`}>
                          {formData.activityProposal.length.toLocaleString()} / 2,000자
                        </span>
                      </div>
                      <textarea
                        name="activityProposal"
                        value={formData.activityProposal}
                        onChange={handleInputChange}
                        maxLength={2000}
                        rows={4}
                        placeholder="HIVE 학회에서 참여하고 싶거나 직접 기획해보고 싶은 활동, 스터디, 공모전, 소모임 프로젝트 아이디어를 자유롭게 제안해 주세요. (관광/호스피탈리티 분야뿐만 아니라 IT, 마케팅, 미디어, 창업 등 모든 분야 제안 가능)"
                        className="w-full bg-ivory border border-navy-900/10 focus:border-hive-green focus:outline-none rounded-xl p-4 text-sm font-sans resize-none transition-all"
                      />
                    </div>

                    {/* Personal Information & Consent Agreement */}
                    <div className="p-4 bg-ivory/80 border border-navy-900/15 rounded-2xl space-y-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="consent-checkbox"
                          checked={isAgreed}
                          onChange={(e) => setIsAgreed(e.target.checked)}
                          className="mt-0.5 w-4 h-4 text-hive-green rounded border-slate-300 focus:ring-hive-green cursor-pointer accent-hive-green"
                        />
                        <label htmlFor="consent-checkbox" className="text-xs font-bold text-navy-900 leading-snug cursor-pointer select-none">
                          <span className="text-hive-green font-black">[필수]</span> 개인정보 수집·이용 및 입회 지원서 작성 내용 동의
                        </label>
                      </div>
                      <div className="text-[11px] text-navy-900/60 leading-relaxed font-sans bg-white/70 p-3 rounded-xl border border-navy-900/10 space-y-1">
                        <p>• <strong>수집 항목:</strong> 성명, 학번, 학과, 연락처, 이메일, 프로필 사진, 지원동기, 강점 및 관심분야</p>
                        <p>• <strong>수집 및 이용 목적:</strong> 대구대학교 HIVE 학회원 선발 심사, 합격 통지, 학회원 명부 등록 및 개인 포트폴리오 관리</p>
                        <p>• <strong>보유 및 이용 기간:</strong> 입회 지원서 제출 후 학회 활동 목적 달성 시까지 보관되며, 탈퇴 요청 시 즉시 파기됩니다.</p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 text-white font-bold rounded-xl tracking-widest text-xs uppercase transition-all flex items-center justify-center shadow-lg cursor-pointer ${
                        isSubmitting
                          ? 'bg-navy-900/30 shadow-none cursor-wait text-white/50'
                          : 'bg-hive-green hover:bg-hive-green/90 text-white shadow-hive-green/20 active:scale-[0.99]'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          제출하는 중...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          지원하기 <Send size={14} className="ml-2" />
                        </div>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* General FAQ section rendering */}
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-navy-900/40 font-bold mb-6">Frequently Asked Questions</h4>
              <div className="space-y-2">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="border-b border-navy-900/10">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full py-4 flex justify-between items-center text-left hover:text-hive-green transition-colors"
                    >
                      <span className="font-semibold text-sm text-navy-900">{faq.question}</span>
                      <ChevronDown size={16} className={`transition-transform text-navy-900/40 ${openFaq === idx ? 'rotate-180 text-hive-green' : ''}`} />
                    </button>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="pb-4 text-xs text-navy-900/60 leading-relaxed font-sans"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Application Viewer Modal */}
      <ApplicationAdminModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
      />
    </div>
  );
};

export default Join;
