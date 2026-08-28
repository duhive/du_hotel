import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Plus, RotateCcw, Edit2, Trash2, BookOpen, 
  X, Loader2, CheckCircle2, AlertTriangle, PlusCircle, User, Sparkles, Lightbulb, Lock
} from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, 
  doc, writeBatch, query, orderBy, serverTimestamp, onSnapshot, setDoc
} from 'firebase/firestore';
import { WeeklySession } from '../types';
import SeminarTopicModal, { SeminarTopicData } from './SeminarTopicModal';

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
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const DEFAULT_WEEKLY_SESSIONS: Omit<WeeklySession, 'id'>[] = [
  // 1학기 (Spring)
  {
    week: 1,
    track: '정기 세미나',
    title: 'HIVE Orientation',
    description: '학회 이념, 글로벌 서비스 경영학 기초 개념 정리 및 팀 편성',
    deliverable: '팀별 연구 도메인 선정 보고서',
    semester: '1학기'
  },
  {
    week: 2,
    track: '실무 워크숍',
    title: 'Service Trend',
    description: '사용자 관점의 서비스 접점(Touchpoint) 진단 및 문제 정의 방법론',
    deliverable: '초안 Customer Journey Map',
    semester: '1학기'
  },
  {
    week: 3,
    track: '팀 프로젝트',
    title: 'Business Case Study',
    description: '무인 키오스크, 생체인식, IoT 기기 도입에 따른 서비스 블루프린트 개편',
    deliverable: 'DX 서비스 아키텍처 다이어그램',
    semester: '1학기'
  },
  {
    week: 4,
    track: '정기 세미나',
    title: '중간 학술 리포트 공유회',
    description: '발표 주제 중간 점검 및 학술적 피드백 수렴',
    deliverable: '중간 학술 리포트 피피티',
    semester: '1학기'
  },
  {
    week: 5,
    track: '실무 워크숍',
    title: 'UX/UI 서비스 분석',
    description: '디지털 헬스케어 및 스마트 팩토리 서비스의 사용자 경험 분석',
    deliverable: 'UX 평가 분석 보고서',
    semester: '1학기'
  },
  {
    week: 6,
    track: '팀 프로젝트',
    title: '스마트 시나리오 제안',
    description: 'HIVE 1차 프로젝트 최종 발표 및 혁신 서비스 시나리오 피칭',
    deliverable: '최종 학술 칼럼 초안',
    semester: '1학기'
  },
  // 2학기 (Fall)
  {
    week: 1,
    track: '정기 세미나',
    title: '2학기 Kick-off & 트렌드 전망',
    description: '하반기 호스피탈리티 테크 동향 공유 및 세미나 발표 주제 매칭',
    deliverable: '개인 학술 발표 계획서',
    semester: '2학기'
  },
  {
    week: 2,
    track: '실무 워크숍',
    title: '빅데이터 분석 실무',
    description: 'R 및 Python을 이용한 글로벌 관광 행동 데이터 전처리 및 탐색적 분석',
    deliverable: '데이터 시각화 그래프',
    semester: '2학기'
  },
  {
    week: 3,
    track: '팀 프로젝트',
    title: 'AI 에이전트 서비스 기획',
    description: '관광/호텔 컨시어지 AI 에이전트 프롬프트 엔지니어링 및 시나리오 구축',
    deliverable: 'AI 가이드 시나리오 시연영상',
    semester: '2학기'
  },
  {
    week: 4,
    track: '정기 세미나',
    title: '2학기 중간 교류회',
    description: '타 학회 연계 학술 포럼 준비 및 합동 세미나 점검',
    deliverable: '포럼 발표용 요약본',
    semester: '2학기'
  },
  {
    week: 5,
    track: '실무 워크숍',
    title: '플랫폼 비즈니스 고도화',
    description: '관광 유통 플랫폼(OTA) 비즈니스 모델 캔버스 고도화 및 분석',
    deliverable: 'OTA 비즈니스 개선 제안서',
    semester: '2학기'
  },
  {
    week: 6,
    track: '종합 학술제',
    title: '최종 HIVE 학술제',
    description: '한 해 학술 발표 성과 공유 및 H&T Academic Portal 등재 심사',
    deliverable: '학회 보도자료 및 최종 논문',
    semester: '2학기'
  }
];

export const INITIAL_SEMINAR_TOPICS: SeminarTopicData[] = [
  // Round 1
  {
    id: 'sem-topic-01',
    title: '제주특별자치도 관광 산업의 발전 전략',
    category: '로컬 관광 개발',
    description: '제주 관광 산업의 지속 가능한 미래 발전 방안 및 인프라 고도화 분석',
    round: 1,
    presenter: {
      name: '송진혁',
      role: 'YB',
      affiliation: '호텔외식관광학과 23',
      image: 'https://i.ibb.co/S4xLSnSD/2026-08-08-224456.png'
    }
  },
  {
    id: 'sem-topic-02',
    title: '스포츠 메가 이벤트(마라톤 축제)와 관광산업 시너지',
    category: '스포츠 레저 관광',
    description: '참여형 스포츠 이벤트 활성화가 지역 목적지 관광 수요 및 상권에 미치는 효과',
    round: 1,
    presenter: {
      name: '고승민',
      role: 'YB',
      affiliation: '호텔외식관광학과 23',
      image: 'https://i.ibb.co/ymb9d6wb/4.png'
    }
  },
  {
    id: 'sem-topic-03',
    title: '지역 대표 축제의 경제적 효과와 지속 가능성',
    category: '축제 경제학',
    description: '로컬 축제의 실질적 경제 파급 효과 측정 모델 및 지속 가능한 친환경 관리 설계',
    round: 1,
    presenter: {
      name: '조석기',
      role: 'YB',
      affiliation: '호텔외식관광학과 23',
      image: 'https://i.ibb.co/TGvX4D7/28.png'
    }
  },
  {
    id: 'sem-topic-04',
    title: '글로벌 호스피탈리티 호텔 서비스 오퍼레이션의 이해',
    category: '호스피탈리티',
    description: '현대 호텔 산업 내 핵심 서비스 접점 및 효율적 고객 여정 관리 모델링',
    round: 1,
    presenter: {
      name: '강경임',
      role: '1기 학회장',
      affiliation: '호텔외식관광학과 24',
      image: 'https://i.ibb.co/v6z0pWtm/image.jpg'
    }
  },
  {
    id: 'sem-topic-05',
    title: '축제/이벤트가 도시 목적지 브랜드 이미지에 미치는 영향',
    category: '목적지 브랜딩',
    description: '메가 이벤트 기획과 브랜딩 활동이 도시 이미지 및 관광객 재방문 의도에 미치는 영향',
    round: 1,
    presenter: {
      name: '박예은',
      role: '교육',
      affiliation: '호텔외식관광학과 22',
      image: 'https://i.ibb.co/9mTfw9zq/image.jpg'
    }
  },
  {
    id: 'sem-topic-06',
    title: '서비스 여정 단계별 맞춤형 고객 경험(CX) 설계',
    category: '경험 디자인 (CX)',
    description: '디지털 및 대면 터치포인트 진단을 통한 고객 여정 지도(CJM) 고도화 방법론',
    round: 1,
    presenter: {
      name: '김민경',
      role: 'PR',
      affiliation: '호텔외식관광학과 25',
      image: 'https://i.ibb.co/TGvX4D7/28.png'
    }
  },
  {
    id: 'sem-topic-07',
    title: '지방 소도시 활성화를 위한 로컬 관광 콘텐츠 제안',
    category: '소도시 활성화',
    description: '인구 감소 지역의 생존을 위한 특색 있는 로컬 콘텐츠 발굴 및 관광 생태계 활성화',
    round: 1,
    presenter: {
      name: '김하경',
      role: '대외협력',
      affiliation: '관광항공경영학과 20',
      image: 'https://i.ibb.co/mC5PxwhH/image.png'
    }
  },
  {
    id: 'sem-topic-08',
    title: '국내 크루즈 관광 산업 분석 및 연계 고도화',
    category: '모빌리티 & 크루즈',
    description: '크루즈 관광 시장 동향 및 국내 주요 기항지 연계 관광 활성화 서비스 프레임워크',
    round: 1,
    presenter: {
      name: '김성학',
      role: '회계',
      affiliation: '호텔외식관광학과 24',
      image: 'https://i.ibb.co/TGvX4D7/28.png'
    }
  },
  // Round 2
  {
    id: 'sem-topic-09',
    title: '국제 지정학적 리스크 및 유가 상승과 글로벌 관광 산업 영향',
    category: '거시경제 분석',
    description: '거시 정세 변화와 에너지 비용 변동이 국제 관광 수요 및 교통 인프라에 미치는 복합 영향',
    round: 2,
    presenter: {
      name: '김재환',
      role: 'YB',
      affiliation: '호텔관광경영학부 26',
      image: 'https://i.ibb.co/v6rTnkYv/Kakao-Talk-20260322-200810881.jpg'
    }
  },
  {
    id: 'sem-topic-10',
    title: '역사·문화유산 보존과 지속 가능한 관광 수요의 상관관계',
    category: '문화유산 연계',
    description: '역사 문화재 보존 상태 및 매력도가 글로벌 관광 수요 촉진에 미치는 인과 분석',
    round: 2,
    presenter: {
      name: '박유진',
      role: 'Partner',
      affiliation: 'HIVE Partner',
      image: 'https://i.ibb.co/Z1Tk4T4L/2026-05-05-160901.png'
    }
  },
  {
    id: 'sem-topic-11',
    title: '저비용 항공사(LCC) 성장과 아웃바운드 관광 확대',
    category: '항공 모빌리티',
    description: 'LCC 신규 취항 및 요금 전략이 글로벌 관광객 행동 및 여행 접근성 개선에 미치는 영향',
    round: 2,
    presenter: {
      name: '송진혁',
      role: 'YB',
      affiliation: '호텔외식관광학과 23',
      image: 'https://i.ibb.co/S4xLSnSD/2026-08-08-224456.png'
    }
  }
];

export const WeeklyRoadmap = () => {
  const [sessions, setSessions] = useState<WeeklySession[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('1학기');
  const [presentationRound, setPresentationRound] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Password Authorization State (Code: 2405)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<
    | { type: 'add_session' }
    | { type: 'edit_session'; session: WeeklySession }
    | { type: 'delete_session'; session: WeeklySession }
    | { type: 'reset_sessions' }
    | { type: 'add_seminar_topic' }
    | { type: 'edit_seminar_topic'; topic: SeminarTopicData }
    | { type: 'delete_seminar_topic'; topicId: string }
    | null
  >(null);

  // Seminar topics state
  const [seminarTopics, setSeminarTopics] = useState<SeminarTopicData[]>([]);
  const [isSeminarModalOpen, setIsSeminarModalOpen] = useState<boolean>(false);
  const [editingSeminarTopic, setEditingSeminarTopic] = useState<SeminarTopicData | null>(null);

  // Weekly Sessions Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingSession, setEditingSession] = useState<WeeklySession | null>(null);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState<boolean>(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false);
  const [sessionToDelete, setSessionToDelete] = useState<WeeklySession | null>(null);

  // Form Fields for Weekly Sessions
  const [formWeek, setFormWeek] = useState<number>(1);
  const [formTrack, setFormTrack] = useState<string>('공통 (Common)');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formDeliverable, setFormDeliverable] = useState<string>('');
  const [formSemester, setFormSemester] = useState<string>('1학기');

  // Fetch weekly sessions
  const fetchSessions = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const q = query(collection(db, 'weeklySessions'), orderBy('week', 'asc'));
      const snapshot = await getDocs(q);
      const fetched: WeeklySession[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as WeeklySession);
      });

      if (fetched.length === 0) {
        await seedDefaultSessions();
      } else {
        setSessions(fetched);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'weeklySessions');
      setErrorMsg('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Sync seminar topics with Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'seminarTopics'), (snapshot) => {
      if (snapshot.empty) {
        seedInitialSeminarTopics();
      } else {
        const fetchedTopics: SeminarTopicData[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SeminarTopicData[];
        setSeminarTopics(fetchedTopics);
      }
    }, (err) => {
      console.error('Seminar topics listener error:', err);
      setSeminarTopics(INITIAL_SEMINAR_TOPICS);
    });

    return () => unsub();
  }, []);

  const seedInitialSeminarTopics = async () => {
    try {
      const batch = writeBatch(db);
      INITIAL_SEMINAR_TOPICS.forEach((topic) => {
        const docRef = doc(db, 'seminarTopics', topic.id!);
        batch.set(docRef, {
          title: topic.title,
          category: topic.category,
          description: topic.description,
          round: topic.round,
          presenter: topic.presenter,
          createdAt: serverTimestamp()
        });
      });
      await batch.commit();
    } catch (err) {
      console.error('Failed to seed seminar topics:', err);
      setSeminarTopics(INITIAL_SEMINAR_TOPICS);
    }
  };

  const seedDefaultSessions = async () => {
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      DEFAULT_WEEKLY_SESSIONS.forEach((session) => {
        const newDocRef = doc(collection(db, 'weeklySessions'));
        batch.set(newDocRef, {
          ...session,
          createdAt: serverTimestamp()
        });
      });
      await batch.commit();
      
      const q = query(collection(db, 'weeklySessions'), orderBy('week', 'asc'));
      const snapshot = await getDocs(q);
      const fetched: WeeklySession[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as WeeklySession);
      });
      setSessions(fetched);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'weeklySessions');
      setErrorMsg('초기 데이터 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const snapshot = await getDocs(collection(db, 'weeklySessions'));
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      await seedDefaultSessions();
      setIsConfirmResetOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'weeklySessions');
      setErrorMsg('초기화 도중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // Password Submit Handler
  const handlePasswordSubmit = () => {
    if (passwordInput === '2405') {
      setIsPasswordModalOpen(false);
      setPasswordInput('');
      setPasswordError(false);

      if (pendingAction) {
        switch (pendingAction.type) {
          case 'add_session':
            executeOpenAddForm();
            break;
          case 'edit_session':
            executeOpenEditForm(pendingAction.session);
            break;
          case 'delete_session':
            setSessionToDelete(pendingAction.session);
            setIsConfirmDeleteOpen(true);
            break;
          case 'reset_sessions':
            setIsConfirmResetOpen(true);
            break;
          case 'add_seminar_topic':
            executeOpenAddSeminarTopic();
            break;
          case 'edit_seminar_topic':
            executeOpenEditSeminarTopic(pendingAction.topic);
            break;
          case 'delete_seminar_topic':
            executeDeleteSeminarTopic(pendingAction.topicId);
            break;
        }
      }
      setPendingAction(null);
    } else {
      setPasswordError(true);
    }
  };

  // Executions after password pass
  const executeOpenAddForm = () => {
    setEditingSession(null);
    const currentSemesterSessions = sessions.filter(s => s.semester === selectedSemester);
    const maxWeek = currentSemesterSessions.reduce((max, s) => s.week > max ? s.week : max, 0);
    
    setFormWeek(maxWeek + 1);
    setFormTrack('정기 세미나');
    setFormTitle('');
    setFormDescription('');
    setFormDeliverable('');
    setFormSemester(selectedSemester);
    setIsFormOpen(true);
  };

  const executeOpenEditForm = (session: WeeklySession) => {
    setEditingSession(session);
    setFormWeek(session.week);
    setFormTrack(session.track);
    setFormTitle(session.title);
    setFormDescription(session.description);
    setFormDeliverable(session.deliverable);
    setFormSemester(session.semester);
    setIsFormOpen(true);
  };

  const executeOpenAddSeminarTopic = () => {
    setEditingSeminarTopic(null);
    setIsSeminarModalOpen(true);
  };

  const executeOpenEditSeminarTopic = (topic: SeminarTopicData) => {
    setEditingSeminarTopic(topic);
    setIsSeminarModalOpen(true);
  };

  const executeDeleteSeminarTopic = async (topicId: string) => {
    if (!window.confirm('이 세미나 발표 주제를 정말로 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'seminarTopics', topicId));
    } catch (err) {
      console.error('Error deleting seminar topic:', err);
      handleFirestoreError(err, OperationType.DELETE, `seminarTopics/${topicId}`);
    }
  };

  // Password Trigger Wrappers
  const handleOpenAddForm = () => {
    setPendingAction({ type: 'add_session' });
    setIsPasswordModalOpen(true);
  };

  const handleOpenEditForm = (session: WeeklySession) => {
    setPendingAction({ type: 'edit_session', session });
    setIsPasswordModalOpen(true);
  };

  const handleRequestDeleteSession = (session: WeeklySession) => {
    setPendingAction({ type: 'delete_session', session });
    setIsPasswordModalOpen(true);
  };

  const handleRequestReset = () => {
    setPendingAction({ type: 'reset_sessions' });
    setIsPasswordModalOpen(true);
  };

  const handleOpenAddSeminarTopic = () => {
    setPendingAction({ type: 'add_seminar_topic' });
    setIsPasswordModalOpen(true);
  };

  const handleOpenEditSeminarTopic = (topic: SeminarTopicData) => {
    setPendingAction({ type: 'edit_seminar_topic', topic });
    setIsPasswordModalOpen(true);
  };

  const handleDeleteSeminarTopic = (topicId: string) => {
    setPendingAction({ type: 'delete_seminar_topic', topicId });
    setIsPasswordModalOpen(true);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSaving(true);
    setErrorMsg(null);
    try {
      if (editingSession?.id) {
        const docRef = doc(db, 'weeklySessions', editingSession.id);
        const updateData = {
          week: Number(formWeek),
          track: formTrack,
          title: formTitle,
          description: formDescription,
          deliverable: formDeliverable,
          semester: formSemester,
        };
        await updateDoc(docRef, updateData);
        setSessions(prev => prev.map(s => s.id === editingSession.id ? { ...s, ...updateData } : s));
      } else {
        const docRef = await addDoc(collection(db, 'weeklySessions'), {
          week: Number(formWeek),
          track: formTrack,
          title: formTitle,
          description: formDescription,
          deliverable: formDeliverable,
          semester: formSemester,
          createdAt: serverTimestamp()
        });
        setSessions(prev => [...prev, {
          id: docRef.id,
          week: Number(formWeek),
          track: formTrack,
          title: formTitle,
          description: formDescription,
          deliverable: formDeliverable,
          semester: formSemester
        }]);
      }
      setIsFormOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'weeklySessions');
      setErrorMsg('세션 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete?.id) return;
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, 'weeklySessions', sessionToDelete.id));
      setSessions(prev => prev.filter(s => s.id !== sessionToDelete.id));
      setIsConfirmDeleteOpen(false);
      setSessionToDelete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `weeklySessions/${sessionToDelete.id}`);
      setErrorMsg('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSeminarTopic = async (data: SeminarTopicData) => {
    try {
      if (data.id) {
        // Edit
        const docRef = doc(db, 'seminarTopics', data.id);
        await setDoc(docRef, {
          title: data.title,
          category: data.category,
          description: data.description,
          round: data.round,
          presenter: data.presenter,
          createdAt: serverTimestamp()
        });
      } else {
        // Add
        const newRef = doc(collection(db, 'seminarTopics'));
        await setDoc(newRef, {
          title: data.title,
          category: data.category,
          description: data.description,
          round: data.round,
          presenter: data.presenter,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Error saving seminar topic:', err);
      handleFirestoreError(err, OperationType.WRITE, 'seminarTopics');
    }
  };

  const currentSessions = sessions.filter(s => s.semester === selectedSemester);
  const filteredSeminarTopics = seminarTopics.filter(t => t.round === presentationRound);

  return (
    <div className="w-full">
      {/* Semester Selector Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-hive-green/10 text-hive-green text-xs font-bold rounded-full mb-2">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            Curriculum Roadmap
          </span>
          <h3 className="text-2xl font-bold text-navy-900 font-display">
            학기별 교육 커리큘럼 세션
          </h3>
          <p className="text-xs text-navy-900/60 font-medium mt-1">
            HIVE 학회의 정기 세미나, 워크숍, 팀 프로젝트 주차별 실무 활동 로드맵입니다.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {/* Semester Tabs */}
          <div className="flex bg-navy-900/5 p-1 rounded-2xl border border-navy-900/10">
            <button
              onClick={() => setSelectedSemester('1학기')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                selectedSemester === '1학기'
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'text-navy-900/60 hover:text-navy-900 hover:bg-navy-900/5'
              }`}
            >
              1학기 (Spring)
            </button>
            <button
              onClick={() => setSelectedSemester('2학기')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                selectedSemester === '2학기'
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'text-navy-900/60 hover:text-navy-900 hover:bg-navy-900/5'
              }`}
            >
              2학기 (Fall)
            </button>
          </div>

          {/* Add Session Button */}
          <button
            onClick={handleOpenAddForm}
            className="px-3.5 py-2 rounded-xl bg-hive-green text-white font-extrabold text-xs hover:bg-hive-green/90 transition-all cursor-pointer shadow-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>세션 추가</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleRequestReset}
            title="기본 세션 커리큘럼으로 초기화"
            className="p-2 rounded-xl text-navy-900/40 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-navy-900/10 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-navy-900/40 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-hive-green" />
          <p className="text-xs font-bold">커리큘럼 데이터를 불러오는 중...</p>
        </div>
      ) : (
        /* Sessions Timeline Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {currentSessions.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-navy-900/5 rounded-3xl border border-dashed border-navy-900/10">
                <BookOpen className="w-10 h-10 text-navy-900/20 mx-auto mb-3" />
                <p className="text-sm font-bold text-navy-900/60">
                  등록된 {selectedSemester} 세션이 없습니다.
                </p>
                <button
                  onClick={handleOpenAddForm}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />첫 세션 추가하기
                </button>
              </div>
            ) : (
              currentSessions.map((session, idx) => (
                <motion.div
                  key={session.id || idx}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-6 border border-navy-900/5 shadow-xs hover:shadow-md hover:border-hive-green/30 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    {/* Top Row: Week & Track */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="px-2.5 py-1 bg-navy-900 text-white text-[10px] font-black rounded-lg font-mono">
                        WEEK {session.week}
                      </span>
                      <span className="text-[11px] font-extrabold text-hive-green tracking-wider uppercase bg-hive-green/10 px-2.5 py-0.5 rounded-full">
                        {session.track}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-base font-extrabold text-navy-900 mb-2 group-hover:text-hive-green transition-colors leading-snug">
                      {session.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-navy-900/70 font-medium leading-relaxed mb-4">
                      {session.description}
                    </p>
                  </div>

                  {/* Bottom: Deliverable & Actions */}
                  <div className="pt-4 border-t border-navy-900/5 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-[11px] text-navy-900/60 font-semibold truncate pr-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-hive-green shrink-0" />
                      <span className="truncate">{session.deliverable || '산출물 작성'}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleOpenEditForm(session)}
                        className="p-1.5 rounded-lg text-navy-900/40 hover:text-navy-900 hover:bg-navy-900/5 transition-colors cursor-pointer"
                        title="수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRequestDeleteSession(session)}
                        className="p-1.5 rounded-lg text-navy-900/40 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 1학기 학회원 학술 세미나 주제 Section */}
      {selectedSemester === '1학기' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 pt-16 border-t border-navy-900/10"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4">
            <div>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-hive-green/10 text-hive-green text-[10px] font-bold rounded-full mb-3 uppercase tracking-wider">
                💡 Academic Seminar Topics
              </span>
              <h4 className="text-2xl font-bold text-navy-900 font-display">
                1학기 학회원 학술 세미나 주제
              </h4>
              <p className="text-xs text-navy-900/60 font-semibold mt-1">
                학회원들이 1학기 동안 진행한 개인별 세미나 발표 주제 및 글로벌 서비스 관광 이슈 분석 세션의 실무 발표 아카이브입니다.
              </p>
            </div>
            
            {/* Round Filter Tabs & Add Button */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-end">
              <div className="flex gap-1 bg-navy-900/5 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPresentationRound(1)}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                    presentationRound === 1
                      ? 'bg-hive-green text-white shadow-xs'
                      : 'text-navy-900/50 hover:text-navy-900 hover:bg-hive-green/5'
                  }`}
                >
                  1차 학술 세미나 발표
                </button>
                <button
                  type="button"
                  onClick={() => setPresentationRound(2)}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                    presentationRound === 2
                      ? 'bg-hive-green text-white shadow-xs'
                      : 'text-navy-900/50 hover:text-navy-900 hover:bg-hive-green/5'
                  }`}
                >
                  2차 글로벌 관광 이슈 분석
                </button>
              </div>

              {/* Add Seminar Topic Button */}
              <button
                type="button"
                onClick={handleOpenAddSeminarTopic}
                className="px-3.5 py-2 rounded-xl bg-navy-900 text-white font-bold text-xs hover:bg-navy-800 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-hive-green" />
                <span>세미나 주제 등록</span>
              </button>
            </div>
          </div>

          {/* Grid of Topics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeminarTopics.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-navy-900/5 rounded-3xl border border-dashed border-navy-900/10">
                <Lightbulb className="w-8 h-8 text-navy-900/20 mx-auto mb-2" />
                <p className="text-xs font-bold text-navy-900/60">
                  {presentationRound}차 세미나에 등록된 발표 주제가 없습니다.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddSeminarTopic}
                  className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 bg-hive-green text-white rounded-xl text-xs font-bold hover:bg-hive-green/90 transition-colors cursor-pointer"
                >
                  <Plus size={14} /> 첫 세미나 주제 기고하기
                </button>
              </div>
            ) : (
              filteredSeminarTopics.map((topic, i) => (
                <motion.div
                  key={topic.id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="bg-white rounded-2xl p-6 border border-navy-900/5 shadow-xs hover:shadow-md hover:border-hive-green/20 transition-all duration-300 flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Category Badge & Actions */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="inline-block px-2.5 py-0.5 bg-navy-900/5 text-navy-900/70 border border-navy-900/10 text-[9px] font-extrabold rounded-md tracking-wider uppercase">
                        {topic.category}
                      </span>

                      {/* Edit / Delete Options */}
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEditSeminarTopic(topic)}
                          className="p-1 rounded text-navy-900/40 hover:text-navy-900 hover:bg-navy-900/5 transition-colors cursor-pointer"
                          title="발표 주제 수정"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => topic.id && handleDeleteSeminarTopic(topic.id)}
                          className="p-1 rounded text-navy-900/40 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="발표 주제 삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Topic Title */}
                    <h5 className="text-sm font-extrabold text-navy-900 mb-2 leading-snug group-hover:text-hive-green transition-colors">
                      {topic.title}
                    </h5>

                    {/* Description */}
                    <p className="text-[11px] text-navy-900/60 font-semibold leading-relaxed mb-4">
                      {topic.description}
                    </p>
                  </div>

                  {/* Presenter Profile Card Footer */}
                  <div className="mt-4 pt-3.5 border-t border-navy-900/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={topic.presenter?.image || 'https://i.ibb.co/TGvX4D7/28.png'}
                        alt={topic.presenter?.name || '발표자'}
                        className="w-8 h-8 rounded-full object-cover border border-navy-900/10 shrink-0 shadow-2xs"
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-extrabold text-navy-900 leading-none truncate flex items-center gap-1">
                          <span>{topic.presenter?.name || '익명 학회원'}</span>
                          {topic.presenter?.role && (
                            <span className="text-[9px] font-bold text-hive-green bg-hive-green/10 px-1 py-0.2 rounded">
                              {topic.presenter.role}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-navy-900/40 font-semibold truncate mt-0.5">
                          {topic.presenter?.affiliation || '호텔외식관광학과'}
                        </div>
                      </div>
                    </div>

                    <span className="text-[9px] font-black text-hive-green uppercase tracking-wider shrink-0 font-mono ml-2">
                      {presentationRound === 1 ? 'SEMINAR R1' : 'GLOBAL R2'}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* MODAL: Password Verification */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-navy-900/10 space-y-4"
            >
              <div className="mx-auto w-12 h-12 rounded-2xl bg-hive-green/10 flex items-center justify-center text-hive-green">
                <Lock className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h5 className="font-extrabold text-navy-900 text-base">관리자 암호 확인</h5>
                <p className="text-xs text-navy-900/60 font-medium mt-1 leading-relaxed">
                  교육 커리큘럼 및 학술 세미나 발표 주제를 수정/등록하려면 학회 전용 비밀번호를 입력하세요.
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="비밀번호 입력"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordSubmit();
                    }
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl text-center text-sm font-bold tracking-widest focus:outline-none ${
                    passwordError ? 'border-rose-500 focus:border-rose-500' : 'border-navy-900/15 focus:border-hive-green'
                  }`}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-center text-[10px] text-rose-500 font-bold">비밀번호가 일치하지 않습니다.</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordInput('');
                    setPasswordError(false);
                    setPendingAction(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-navy-900/60 bg-navy-900/5 hover:bg-navy-900/10 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  className="flex-1 py-2.5 bg-hive-green text-white rounded-xl text-xs font-bold hover:bg-hive-green/90 transition-all cursor-pointer shadow-xs"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Seminar Topic Form */}
      <SeminarTopicModal
        isOpen={isSeminarModalOpen}
        onClose={() => {
          setIsSeminarModalOpen(false);
          setEditingSeminarTopic(null);
        }}
        editingTopic={editingSeminarTopic}
        defaultRound={presentationRound}
        onSave={handleSaveSeminarTopic}
      />

      {/* MODAL: Add/Edit Weekly Session Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden border border-navy-900/10"
            >
              <div className="p-6 border-b border-navy-900/5 flex items-center justify-between bg-[#f8fafc]">
                <h5 className="font-extrabold text-navy-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-hive-green" />
                  <span>{editingSession ? '주차 세션 수정' : '새 주차 세션 추가'}</span>
                </h5>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-navy-900/5 text-navy-900/40 hover:text-navy-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSession} className="p-6 space-y-4">
                {/* Semester and Week */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-navy-900 uppercase tracking-wider mb-1.5">
                      학기 구분 *
                    </label>
                    <select
                      value={formSemester}
                      onChange={(e) => setFormSemester(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-navy-900/10 text-xs font-bold focus:outline-hidden focus:border-hive-green"
                    >
                      <option value="1학기">1학기 (Spring)</option>
                      <option value="2학기">2학기 (Fall)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-navy-900 uppercase tracking-wider mb-1.5">
                      주차 (Week) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={52}
                      value={formWeek}
                      onChange={(e) => setFormWeek(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-navy-900/10 text-xs font-bold focus:outline-hidden focus:border-hive-green"
                    />
                  </div>
                </div>

                {/* Track */}
                <div>
                  <label className="block text-[11px] font-black text-navy-900 uppercase tracking-wider mb-1.5">
                    세션 구분 (분류) *
                  </label>
                  <select
                    value={formTrack}
                    onChange={(e) => setFormTrack(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-900/10 text-xs font-bold focus:outline-hidden focus:border-hive-green mb-2"
                  >
                    <option value="정기 세미나">정기 세미나</option>
                    <option value="실무 워크숍">실무 워크숍</option>
                    <option value="팀 프로젝트">팀 프로젝트</option>
                    <option value="종합 학술제">종합 학술제</option>
                    <option value="기타">기타 (직접 입력)</option>
                  </select>
                  {formTrack === '기타' && (
                    <input
                      type="text"
                      placeholder="구분명을 입력하세요 (예: 특별 강연)"
                      required
                      onChange={(e) => setFormTrack(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-navy-900/10 text-xs font-bold focus:outline-hidden focus:border-hive-green"
                    />
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-black text-navy-900 uppercase tracking-wider mb-1.5">
                    세션 제목 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="세션 제목을 입력해주세요"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-900/10 text-xs font-bold focus:outline-hidden focus:border-hive-green"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-black text-navy-900 uppercase tracking-wider mb-1.5">
                    활동 내용 *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="해당 주차에 진행할 활동 또는 교육 내용을 구체적으로 작성하세요"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-900/10 text-xs font-bold focus:outline-hidden focus:border-hive-green resize-none"
                  />
                </div>

                {/* Deliverable */}
                <div>
                  <label className="block text-[11px] font-black text-navy-900 uppercase tracking-wider mb-1.5">
                    산출물 (선택)
                  </label>
                  <input
                    type="text"
                    placeholder="예: 팀별 발표 자료 및 보고서"
                    value={formDeliverable}
                    onChange={(e) => setFormDeliverable(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-900/10 text-xs font-bold focus:outline-hidden focus:border-hive-green"
                  />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-navy-900/5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold text-navy-900/60 bg-navy-900/5 hover:bg-navy-900/10 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-navy-900 text-white hover:bg-navy-800 transition-colors flex items-center gap-1.5"
                  >
                    {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>저장</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Confirm Reset */}
      <AnimatePresence>
        {isConfirmResetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-xl border border-navy-900/10 space-y-4"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-extrabold text-navy-900 text-base">커리큘럼 로드맵 초기화</h5>
                <p className="text-xs text-navy-900/60 font-semibold mt-2 leading-relaxed">
                  현재 등록된 모든 주차별 세션 정보가 삭제되며, HIVE 공식 기본 세션 커리큘럼(12개 세션)으로 다시 세팅됩니다. 이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setIsConfirmResetOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-navy-900/60 bg-navy-900/5 hover:bg-navy-900/10 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleReset}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>네, 초기화합니다</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Confirm Delete */}
      <AnimatePresence>
        {isConfirmDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-xl border border-navy-900/10 space-y-4"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-extrabold text-navy-900 text-base">주차 세션 삭제</h5>
                <p className="text-xs text-navy-900/60 font-semibold mt-2 leading-relaxed">
                  정말로 {sessionToDelete?.semester} {sessionToDelete?.week}주차 세션 <span className="font-bold text-navy-900">"{sessionToDelete?.title}"</span>을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setIsConfirmDeleteOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-navy-900/60 bg-navy-900/5 hover:bg-navy-900/10 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteSession}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>삭제</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
