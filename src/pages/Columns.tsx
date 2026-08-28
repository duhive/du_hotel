import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  increment,
  query
} from 'firebase/firestore';
import {
  BookOpen,
  Search,
  Plus,
  Bookmark,
  BookMarked,
  Heart,
  Sparkles,
  AlertTriangle,
  Loader2,
  BookmarkCheck,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Award,
  Trash2
} from 'lucide-react';
import { db } from '../firebase';
import { Column } from '../types';
import ColumnCard from '../components/ColumnCard';
import ColumnDetail from '../components/ColumnDetail';
import ColumnForm, { CATEGORY_PRESETS } from '../components/ColumnForm';
import cabinServiceAbout from '../assets/images/cabin_service_about_1782193310292.jpg';

// Strict Firestore Error types as mandated by the Firebase Integration skill
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
    authInfo: {
      userId: null,
      email: null
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Logging: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 2 Beautiful default academic articles to seed if database is empty
const PRE_SEEDED_COLUMNS = [
  {
    id: 'col-default-park-yujin-local',
    title: '지역 고유의 매력을 살린 로컬 관광 콘텐츠 설계와 스마트 환대 가치',
    subtitle: '산청군 관광개발 사례를 중심으로 한 디지털 트랜스포메이션과 감성 경험 디자인',
    excerpt: '대구대학교 호스피탈리티 경영학회 HIVE 소속 파트너 박유진이 제안하는 지역 밀착형 로컬 경험 설계 전략. 지자체 연계 연구과제와 교육 실무 경력을 바탕으로 한 지속 가능한 서비스 모델을 논합니다.',
    content: `### 서론: 로컬과 기술의 만남

현대 관광 산업에서 가장 주목받는 흐름은 '로컬라이제이션(Localization)'과 '디지털 전환(DX)'의 융합입니다. 단순히 멋진 숙소를 짓고 마케팅을 펼치는 것을 넘어, 그 지역만이 가진 역사, 문화, 미식 요소를 현대적인 서비스 디자인 관점에서 재해석하고 스마트 테크놀로지를 결합하여 정교하게 전달해야 합니다.

본 칼럼에서는 경상남도 산청군 등 지자체 관광개발 프로젝트 실무 인턴 경험과 HIVE 학회의 연구 성과를 바탕으로, 로컬 관광 활성화를 위한 서비스 디자인 가치 모델을 제안합니다.

---

### 1. 로컬 브랜드 자산의 발굴과 스토리텔링

성공적인 로컬 관광 설계의 첫 단추는 지역 고유의 자산(Asset)을 정교하게 분석하는 것입니다.
- **고유성(Authenticity) 정의:** 인위적인 관광지가 아닌 지역 밀착형 콘텐츠(예: 산청의 약초, 한방 생태 자원 등)의 본질적 가치를 규명합니다.
- **스토리텔링 디자인:** 단순 관람을 넘어 방문객이 주인공이 되어 감각적으로 체험할 수 있는 고객 여정(Customer Journey) 시나리오를 구성합니다.

---

### 2. 스마트 테크놀로지를 활용한 고객 접점 고도화

첨단 기술은 로컬의 따뜻한 환대 가치를 더 편리하고 완벽하게 만들어주는 '지탱점'이 되어야 합니다.
- **비대면 지역 안내 허브:** 지자체 공공 데이터와 AI 안내 가이드를 결합한 개인 맞춤형 명소 추천 솔루션.
- **스마트 경험 피드백:** 데이터 시각화를 통해 여행객들이 선호하는 경로와 만족도를 수집, 지속 가능한 콘텐츠 고도화에 기여합니다.

---

### 결론: 지역과 학문, 그리고 청년 리더의 연대

결국 지속 가능한 로컬 관광 디자인은 현장 실무와 학술적 데이터의 긴밀한 연대를 통해 완성됩니다. 대구대학교 호스피탈리티 경영학회 HIVE 및 학술 포럼은 앞으로도 글로벌 서비스 연구 역량을 바탕으로, 따뜻한 마음과 차가운 지성을 결합한 선도적 호스피탈리티 솔루션을 제시해 나갈 것입니다.`,
    category: '1차수',
    date: '2026.07.03',
    readTime: '6 min read',
    likes: 42,
    tags: ['LocalTourism', 'ServiceDesign', 'LocalCreator', 'SmartHospitality'],
    coverImage: cabinServiceAbout,
    author: {
      name: '박유진',
      role: 'Partner',
      affiliation: '호스피탈리티 경영학회 HIVE',
      image: 'https://i.ibb.co/Z1Tk4T4L/2026-05-05-160901.png'
    }
  },
  {
    id: 'col-default-ai-coexist',
    title: '호스피탈리티 산업에서의 인공지능(AI)과 인간 서비스의 공존',
    subtitle: '기계적 효율성과 인간의 감성적 가치가 만드는 하이브리드 서비스 패러다임',
    excerpt: '기술 혁신이 가속화되는 현 시점, 호텔과 관광 산업에서 인공지능 기술의 최적의 활용 범위와 한계는 어디일까요? 본 기고글에서는 두 요소의 상보적 관계를 분석합니다.',
    content: `### 서론

최근 몇 년간 호스피탈리티 산업은 인공지능(AI), 로보틱스, 그리고 비대면 키오스크 등 첨단 기술의 도입으로 유례없는 변화를 겪고 있습니다. 과거 호텔리어의 숙련된 손길과 교감이 전부였던 시대를 넘어, 이제는 정교한 알고리즘과 자동화 시스템이 서비스 전반을 지탱하고 있습니다.

하지만 동시에 '호스피탈리티의 본질은 인간적 교감에 있다'는 목소리도 높습니다. 과연 인공지능은 인간 서비스를 완전히 대체할 수 있을까요? 아니면 두 요소는 공존할 수 있을까요?

### 1. 기술적 효율성: AI가 해결하는 페인 포인트(Pain Point)

인공지능과 자동화 기술이 호스피탈리티 산업에서 제공하는 가장 큰 강점은 '효율성'과 '일관성'입니다.
- **예약 및 체크인 자동화:** 24시간 실시간 예약 처리 및 비대면 키오스크를 통해 휴먼 에러를 줄이고 대기 시간을 획기적으로 개선합니다.
- **개인화된 추천 서비스:** AI 데이터 분석 엔진을 통해 고객의 과거 투숙 패턴, 선호도, 소비 성향을 파악하여 맞춤형 패키지 및 메뉴를 사전에 제안합니다.
- **예측적 유지 관리:** 설비 오작동을 사전에 감지하고 에너지 소비를 최적화하여 운영비용을 경감시킵니다.

### 2. 감성적 가치: 인간만이 제공할 수 있는 초개인화 교감

아무리 뛰어난 초거대 언어 모델(LLM)이라 할지라도, 인간이 느끼는 미묘한 감정을 온전히 공감하고 이에 대처하는 데에는 명확한 한계가 존재합니다.
- **환대(Hospitality)의 따뜻함:** 미소와 눈맞춤, 그리고 진심 어린 관심은 단순한 정보 제공 이상의 경험을 고객에게 선사합니다.
- **위기 및 이례적 상황 대처:** 표준화된 규칙으로 해결할 수 없는 갑작스러운 문제(예: 고객의 급작스러운 건강 악화나 심각한 컴플레인) 상황에서 인간의 임기응변과 유연성은 빛을 발합니다.
- **관계의 형성:** 단골 고객과의 친밀한 관계는 하드웨어적 우수성보다 더 강한 브랜드 충성도를 유도합니다.

### 결론: 하이브리드 서비스 모델의 구축

결국 지속 가능한 미래의 서비스 패러다임은 인공지능과 인간이 각자의 영역에서 시너지를 극대화하는 **'하이브리드 서비스 모델(Hybrid Service Model)'**에 달려 있습니다. 단순 반복 작업과 정교한 데이터 처리는 AI에게 전담시키고, 인간 호텔리어는 고객과의 깊은 감정적 교감과 맞춤형 프리미엄 서비스에 집중하도록 돕는 것입니다.

이것이 바로 HIVE 연구회가 지향하는 첨단 기술과 감성 환대의 완벽한 교차점이자, 앞으로 나아가야 할 학술적, 실무적 방향성입니다.`,
    category: '1차수',
    date: '2026.07.01',
    readTime: '5 min read',
    likes: 24,
    tags: ['AI', 'Coexistence', 'HybridService', 'DigitalTransformation'],
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    author: {
      name: '김지민',
      role: '수석 연구원',
      affiliation: '호스피탈리티 경영학회 HIVE',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    }
  },
  {
    id: 'col-default-dx-trend',
    title: '호텔 산업의 디지털 전환(DX) 핵심 트렌드 분석',
    subtitle: '클라우드 PMS와 IoT가 선사하는 스마트 투숙 경험의 실체',
    excerpt: '코로나19 이후 급속도로 가속화된 글로벌 호텔 체인들의 디지털 전환 성공 사례를 토대로, 미래형 스마트 호텔의 필수 인프라와 생태계를 짚어봅니다.',
    content: `### 스마트 호텔의 도래

디지털 전환(Digital Transformation, DX)은 이제 선택이 아닌 생존의 문제입니다. 힐튼, 메리어트 등 글로벌 체인부터 독립형 로컬 호텔에 이르기까지 디지털 기술을 적극적으로 융합하며 고객 여정(Customer Journey)을 재정의하고 있습니다.

### 스마트 투숙의 3대 핵심 기둥

#### 1. 클라우드 기반 자산관리 시스템 (PMS)
호텔 운영의 심장인 PMS가 로컬 서버 방식에서 클라우드 형태로 빠르게 전환되고 있습니다. 이를 통해 언제 어디서나 모바일로 객실 현황을 모니터링하고, 다른 운영 허브와의 유연한 데이터 연동이 가능해집니다.

#### 2. 사물인터넷(IoT)을 활용한 맞춤형 환경 통제
스마트폰 앱을 통해 투숙객이 방에 입장하기 전 객실 온도, 조명 밝기를 선호하는 설정값으로 맞춰둘 수 있습니다. 스마트 키리스(Keyless) 시스템 역시 투숙 경험을 매끄럽게 만듭니다.

#### 3. 빅데이터 및 AI 기반의 실시간 dynamic pricing
주변 지역의 대형 행사 정보, 항공 트래픽, 경쟁사 객실료 데이터 등을 종합하여 실시간으로 객실 요금을 자동 조정(Yield Management)하여 매출을 극대화합니다.

### 과제와 전망

성공적인 DX를 위해서는 값비싼 장비를 도입하는 것만큼이나, 구성원들의 기술 적응 능력을 기르는 **'디지털 마인드셋 체인지'**가 필요합니다. 또한, 고객 개인 정보 수집에 따른 보안 가이드라인 준수가 철저히 동반되어야 할 것입니다.`,
    category: '1차수',
    date: '2026.06.28',
    readTime: '4 min read',
    likes: 18,
    tags: ['DX', 'SmartHotel', 'IoT', 'PMS'],
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    author: {
      name: '이현우',
      role: '연구책임자',
      affiliation: 'HIVE Tech Division',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
    }
  },
  {
    id: 'col-default-round-2-placeholder',
    title: '[준비중] 2차수 학술 칼럼이 발행될 예정입니다',
    subtitle: 'HIVE 학회원 및 파트너들의 차세대 융합 학술 기고 준비 중',
    excerpt: '현재 2차수 학술 연구와 심층적인 트렌드 리포트를 성실하게 집필하고 있습니다. 조만간 공개될 새로운 통찰을 기대해 주세요.',
    content: `### 2차수 학술 칼럼 준비 중

현재 HIVE 학술 편집위원회와 Global Service Group, Tourism & AI Group 소속 연구원들이 **2차수 공식 학술 기고**를 성실히 준비하고 있습니다.

호스피탈리티 트렌드 분석, 모빌리티 및 AI 융합 관광 연구, 서비스 경험 디자인 등 다양한 주제의 논문과 칼럼이 게재될 예정이오니 학회원 여러분의 많은 관심 부탁드립니다.`,
    category: '2차수',
    date: '2026.07.05',
    readTime: '1 min read',
    likes: 0,
    tags: ['ComingSoon', 'Round2'],
    coverImage: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800',
    author: {
      name: 'HIVE 편집위원회',
      role: 'Editor',
      affiliation: 'HIVE Academic Portal',
      image: 'https://i.ibb.co/TGvX4D7/28.png'
    }
  },
  {
    id: 'col-default-round-3-placeholder',
    title: '[준비중] 3차수 학술 칼럼이 발행될 예정입니다',
    subtitle: 'HIVE 학회원 및 파트너들의 차세대 융합 학술 기고 준비 중',
    excerpt: '현재 3차수 학술 연구와 심층적인 트렌드 리포트를 성실하게 집필하고 있습니다. 조만간 공개될 새로운 통찰을 기대해 주세요.',
    content: `### 3차수 학술 칼럼 준비 중

현재 HIVE 학술 편집위원회와 Global Service Group, Tourism & AI Group 소속 연구원들이 **3차수 공식 학술 기고**를 성실히 준비하고 있습니다.

호스피탈리티 트렌드 분석, 모빌리티 및 AI 융합 관광 연구, 서비스 경험 디자인 등 다양한 주제의 논문과 칼럼이 게재될 예정이오니 학회원 여러분의 많은 관심 부탁드립니다.`,
    category: '3차수',
    date: '2026.07.05',
    readTime: '1 min read',
    likes: 0,
    tags: ['ComingSoon', 'Round3'],
    coverImage: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800',
    author: {
      name: 'HIVE 편집위원회',
      role: 'Editor',
      affiliation: 'HIVE Academic Portal',
      image: 'https://i.ibb.co/TGvX4D7/28.png'
    }
  }
];

export default function Columns() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewBookmarkedOnly, setViewBookmarkedOnly] = useState(false);

  // Detail & Form UI State
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);

  // Likes & Bookmarks persistent local state
  const [likedColumns, setLikedColumns] = useState<string[]>([]);
  const [bookmarkedColumns, setBookmarkedColumns] = useState<string[]>([]);

  // Deletion selection state for custom modal confirmation
  const [columnToDeleteId, setColumnToDeleteId] = useState<string | null>(null);

  // Feedback notifications
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Password prompt state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [pendingAction, setPendingAction] = useState<'create' | { type: 'edit'; column: Column } | null>(null);

  // Load Likes & Bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem('hive_liked_columns');
      if (savedLikes) setLikedColumns(JSON.parse(savedLikes));

      const savedBookmarks = localStorage.getItem('hive_bookmarked_columns');
      if (savedBookmarks) setBookmarkedColumns(JSON.parse(savedBookmarks));
    } catch (e) {
      console.error("Local storage read error", e);
    }
  }, []);

  // Save Likes & Bookmarks to localStorage when modified
  const updateLikedInStorage = (newLikes: string[]) => {
    setLikedColumns(newLikes);
    localStorage.setItem('hive_liked_columns', JSON.stringify(newLikes));
  };

  const updateBookmarkedInStorage = (newBookmarks: string[]) => {
    setBookmarkedColumns(newBookmarks);
    localStorage.setItem('hive_bookmarked_columns', JSON.stringify(newBookmarks));
  };

  // Listen to Columns collection in Firestore
  useEffect(() => {
    const columnsRef = collection(db, 'columns');
    const unsubscribe = onSnapshot(columnsRef, async (snapshot) => {
      setIsLoading(false);

      if (snapshot.empty) {
        // If empty and not explicitly cleared by user, seed with beautiful presets
        const hasBeenCleared = localStorage.getItem('hive_columns_cleared');
        if (hasBeenCleared === 'true') {
          setColumns([]);
          return;
        }

        try {
          const batch = writeBatch(db);
          PRE_SEEDED_COLUMNS.forEach((col) => {
            const docRef = doc(db, 'columns', col.id);
            batch.set(docRef, {
              title: col.title,
              subtitle: col.subtitle,
              excerpt: col.excerpt,
              content: col.content,
              category: col.category,
              date: col.date,
              readTime: col.readTime,
              likes: col.likes,
              tags: col.tags,
              coverImage: col.coverImage,
              author: col.author,
              createdAt: serverTimestamp()
            });
          });
          await batch.commit();
        } catch (error) {
          console.error("Error seeding columns:", error);
        }
        return;
      }

      // Populate list from firestore snapshot
      const fetched: Column[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        let cat = data.category || '1차수';
        if (data.author?.name === '박유진') {
          cat = '1차수';
        } else if (cat !== '1차수' && cat !== '2차수' && cat !== '3차수') {
          cat = '1차수';
        }
        fetched.push({ id: docSnapshot.id, ...data, category: cat } as Column);
      });

      // Robust in-memory sorting by createdAt (descending)
      fetched.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setColumns(fetched);

      // Keep active column synchronized if it is open
      if (selectedColumn) {
        const updated = fetched.find(col => col.id === selectedColumn.id);
        if (updated) {
          setSelectedColumn(updated);
        } else {
          setSelectedColumn(null); // was deleted
        }
      }

    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'columns');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedColumn]);

  // Action: Toggle Like count in Firestore and local state
  const handleLike = async (columnId: string) => {
    const isAlreadyLiked = likedColumns.includes(columnId);
    const newLikes = isAlreadyLiked
      ? likedColumns.filter(id => id !== columnId)
      : [...likedColumns, columnId];

    updateLikedInStorage(newLikes);

    try {
      const docRef = doc(db, 'columns', columnId);
      await updateDoc(docRef, {
        likes: increment(isAlreadyLiked ? -1 : 1)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `columns/${columnId}`);
    }
  };

  // Action: Toggle Bookmark local storage
  const handleBookmark = (columnId: string) => {
    const isAlreadyBookmarked = bookmarkedColumns.includes(columnId);
    const newBookmarks = isAlreadyBookmarked
      ? bookmarkedColumns.filter(id => id !== columnId)
      : [...bookmarkedColumns, columnId];

    updateBookmarkedInStorage(newBookmarks);

    showSuccessNotification(
      isAlreadyBookmarked ? '북마크 리스트에서 해제되었습니다.' : '북마크 리스트에 보관되었습니다.'
    );
  };

  // Helper: show success banner
  const showSuccessNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Helper: show error banner
  const showErrorNotification = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(null), 5000);
  };

  // Action: Delete document from Firestore
  const handleDeleteColumn = (columnId: string) => {
    setColumnToDeleteId(columnId);
  };

  // Helper: Actual deletion action execution
  const executeDeleteColumn = async (columnId: string) => {
    setColumnToDeleteId(null);
    try {
      // If we are deleting the last remaining column, mark as cleared to prevent automatic reseeding
      if (columns.length <= 1) {
        localStorage.setItem('hive_columns_cleared', 'true');
      }

      await deleteDoc(doc(db, 'columns', columnId));

      if (selectedColumn?.id === columnId) {
        setSelectedColumn(null);
      }

      showSuccessNotification('학술 칼럼이 성공적으로 삭제되었습니다.');
    } catch (err) {
      showErrorNotification('삭제 과정에 실패했습니다. Firestore 권한 설정을 확인하세요.');
      handleFirestoreError(err, OperationType.DELETE, `columns/${columnId}`);
    }
  };

  // Action: Create or Edit submit handler
  const handleSaveColumnSubmit = async (columnData: any) => {
    try {
      const targetId = columnData.id || `col-user-${Date.now()}`;

      if (columnData.id) {
        // Edit flow:
        // Retain original timestamp & update fields
        const docRef = doc(db, 'columns', targetId);
        await setDoc(docRef, {
          title: columnData.title,
          subtitle: columnData.subtitle,
          excerpt: columnData.excerpt,
          content: columnData.content,
          category: columnData.category,
          date: columnData.date,
          readTime: columnData.readTime,
          likes: columnData.likes || 0,
          tags: columnData.tags,
          coverImage: columnData.coverImage,
          author: columnData.author,
          createdAt: columnData.createdAt // retains existing Firestore timestamp
        });
        showSuccessNotification('학술 칼럼이 성공적으로 수정 완료되었습니다.');
      } else {
        // Create flow:
        localStorage.removeItem('hive_columns_cleared'); // clear flag so list works normally
        const docRef = doc(db, 'columns', targetId);
        await setDoc(docRef, {
          title: columnData.title,
          subtitle: columnData.subtitle,
          excerpt: columnData.excerpt,
          content: columnData.content,
          category: columnData.category,
          date: columnData.date,
          readTime: columnData.readTime,
          likes: 0,
          tags: columnData.tags,
          coverImage: columnData.coverImage,
          author: columnData.author,
          createdAt: serverTimestamp() // server-validated timestamp
        });
        showSuccessNotification('새로운 학술 칼럼이 기고 및 등록되었습니다.');
      }

      setIsFormOpen(false);
      setEditingColumn(null);
    } catch (err) {
      showErrorNotification('칼럼 등록 중 오류가 발생했습니다. 필드 규격을 만족하는지 확인해 주세요.');
      handleFirestoreError(err, OperationType.WRITE, `columns/${columnData.id || 'new'}`);
    }
  };

  const handleTriggerEdit = (column: Column) => {
    setPendingAction({ type: 'edit', column });
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === '2405') {
      setIsPasswordModalOpen(false);
      setPasswordInput('');
      setPasswordError(false);
      
      if (pendingAction === 'create') {
        setEditingColumn(null);
        setIsFormOpen(true);
      } else if (pendingAction && typeof pendingAction === 'object') {
        setEditingColumn(pendingAction.column);
        setIsFormOpen(true);
      }
      setPendingAction(null);
    } else {
      setPasswordError(true);
    }
  };

  // Filter columns based on category, bookmarks, and search query
  const filteredColumns = columns.filter(col => {
    const matchesSearch =
      col.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      col.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      col.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      col.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      col.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || col.category === selectedCategory;
    const matchesBookmarks = !viewBookmarkedOnly || bookmarkedColumns.includes(col.id);

    return matchesSearch && matchesCategory && matchesBookmarks;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Global Notifications Panel */}
        <AnimatePresence>
          {actionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-slate-900 text-white text-sm font-semibold rounded-full shadow-lg flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{actionSuccess}</span>
            </motion.div>
          )}

          {actionError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-red-600 text-white text-sm font-semibold rounded-full shadow-lg flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>{actionError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 mb-4"
          >
            <Award className="w-3.5 h-3.5" />
            <span>HIVE ACADEMIC PORTAL</span>
          </motion.div>
          <motion.h1
            id="columns-main-title"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold text-slate-950 tracking-tight leading-tight mb-4"
          >
            H&T Column
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 leading-relaxed font-medium"
          >
            호스피탈리티 경영과 스마트 하이브리드 기술의 교차점을 다루는 HIVE 학회원들의 독창적인 통찰이 가득한 학술 지식 아카이브입니다.
          </motion.p>
        </div>

        {/* Portal Workspace View */}
        <AnimatePresence mode="wait">
          {selectedColumn ? (
            /* Detailed Reading Layout */
            <ColumnDetail
              key="detail-view"
              column={selectedColumn}
              isLiked={likedColumns.includes(selectedColumn.id)}
              isBookmarked={bookmarkedColumns.includes(selectedColumn.id)}
              onLike={() => handleLike(selectedColumn.id)}
              onBookmark={() => handleBookmark(selectedColumn.id)}
              onEdit={() => handleTriggerEdit(selectedColumn)}
              onDelete={() => handleDeleteColumn(selectedColumn.id)}
              onBack={() => setSelectedColumn(null)}
            />
          ) : (
            /* Directory Feed Layout */
            <motion.div
              key="feed-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Filter & Search Dashboard Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Search Bar */}
                  <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="칼럼 제목, 키워드, 저자, 태그 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Actions (Bookmark toggle & Write button) */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      id="toggle-bookmarks-btn"
                      onClick={() => setViewBookmarkedOnly(!viewBookmarkedOnly)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                        viewBookmarkedOnly
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <BookmarkCheck className={`w-4 h-4 ${viewBookmarkedOnly ? 'fill-amber-500' : ''}`} />
                      <span>{viewBookmarkedOnly ? '보관된 칼럼 보기' : '북마크만 필터'}</span>
                    </button>

                    <button
                      id="write-column-open-btn"
                      onClick={() => {
                        setPendingAction('create');
                        setIsPasswordModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>칼럼 기고하기</span>
                    </button>
                  </div>
                </div>

                {/* Categories Row */}
                <div className="flex flex-wrap items-center gap-1.5 pt-4 border-t border-gray-50">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mr-2">차수 분류</span>
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedCategory === 'All'
                        ? 'bg-slate-900 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    전체보기
                  </button>
                  {CATEGORY_PRESETS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loader */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  <p className="text-gray-400 text-xs font-bold tracking-wide">학술 기고 목록을 안전하게 불러오고 있습니다...</p>
                </div>
              ) : filteredColumns.length === 0 ? (
                /* Empty state */
                <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center px-4">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-1">등록된 학술 칼럼이 없습니다</h3>
                  <p className="text-sm text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                    검색 키워드를 다르게 입력하시거나, 우측 상단의 "칼럼 기고하기" 버튼을 눌러 첫 번째 학술 견해를 작성해 보세요.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setViewBookmarkedOnly(false);
                    }}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    필터 초기화
                  </button>
                </div>
              ) : (
                /* Columns grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredColumns.map((col) => (
                    <ColumnCard
                      key={col.id}
                      column={col}
                      isLiked={likedColumns.includes(col.id)}
                      isBookmarked={bookmarkedColumns.includes(col.id)}
                      onLike={() => handleLike(col.id)}
                      onBookmark={() => handleBookmark(col.id)}
                      onEdit={() => handleTriggerEdit(col)}
                      onDelete={() => handleDeleteColumn(col.id)}
                      onClick={() => setSelectedColumn(col)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Write/Edit Dialog overlay */}
        <AnimatePresence>
          {isFormOpen && (
            <ColumnForm
              editingColumn={editingColumn}
              onSave={handleSaveColumnSubmit}
              onClose={() => {
                setIsFormOpen(false);
                setEditingColumn(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Password Prompt Modal */}
        <AnimatePresence>
          {isPasswordModalOpen && (
            <motion.div
              id="password-prompt-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
              onClick={() => {
                setIsPasswordModalOpen(false);
                setPasswordInput('');
                setPasswordError(false);
                setPendingAction(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl border border-gray-100 p-6 max-w-sm w-full shadow-xl space-y-4"
              >
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-center">
                  <h3 className="text-lg font-bold text-gray-900 font-sans">학술 칼럼 기고 권한</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">
                    학술 칼럼을 기고하거나 수정하려면<br />
                    학회 전용 비밀번호를 입력해 주세요.
                  </p>
                </div>
                <div className="space-y-3">
                  <div>
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
                      className={`w-full px-4 py-2.5 border rounded-xl text-center text-sm font-bold tracking-widest focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 ${
                        passwordError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                      }`}
                      autoFocus
                    />
                    {passwordError && (
                      <p className="text-center text-[10px] text-red-500 font-bold mt-1.5">비밀번호가 일치하지 않습니다.</p>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPasswordModalOpen(false);
                        setPasswordInput('');
                        setPasswordError(false);
                        setPendingAction(null);
                      }}
                      className="flex-1 py-2 px-4 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handlePasswordSubmit}
                      className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      확인
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Delete Confirmation Modal */}
        <AnimatePresence>
          {columnToDeleteId && (
            <motion.div
              id="delete-confirm-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
              onClick={() => setColumnToDeleteId(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl border border-gray-100 p-6 max-w-sm w-full shadow-xl space-y-4 text-center"
              >
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 font-sans">학술 칼럼 삭제</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">
                    정말로 이 기고 칼럼을 삭제하시겠습니까?<br />
                    삭제된 데이터는 영구히 지워지며 복구할 수 없습니다.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    id="cancel-delete-btn"
                    onClick={() => setColumnToDeleteId(null)}
                    className="flex-1 py-2 px-4 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    id="confirm-delete-btn"
                    onClick={() => {
                      if (columnToDeleteId) {
                        executeDeleteColumn(columnToDeleteId);
                      }
                    }}
                    className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    삭제하기
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
