import { Member, CurriculumItem, FAQ } from './types';
import { YOON_SIWON_IMAGE } from './assets/yoonSiwonImage';
import { KIM_YERA_IMAGE } from './assets/kimYeraImage';

export const REGULAR_CURRICULUM: CurriculumItem[] = [
  {
    id: 1,
    title: "호스피탈리티 세미나",
    period: "격주",
    description: "국내외 관광 산업의 최신 이슈와 트렌드를 다각도로 분석하고 시사점을 도출합니다.",
    kpi: "이슈 분석 리포트 발표 2회",
    outcomes: ["이슈 분석 보고서", "트렌드 브리핑"]
  },
  {
    id: 2,
    title: "퍼스널 브랜딩",
    period: "격주",
    description: "학회 활동과 개인의 다채로운 경험 속에서 핵심 역량을 발견하고 포트폴리오를 설계하여, 나만의 고유한 퍼스널 브랜드 가치를 정교하게 고도화하고 표현하는 프로세스를 학습합니다.",
    kpi: "퍼스널 브랜드 에센스 정의 및 디지털 포트폴리오 구축",
    outcomes: ["퍼스널 포트폴리오", "역량 매핑 가이드"]
  },
  {
    id: 3,
    title: "관광 칼럼 / 매거진",
    period: "월간",
    description: "관광·호스피탈리티 산업 트렌드와 학회원들의 독창적인 통찰이 담긴 칼럼 및 학회 매거진을 기획하고 정기적으로 발행합니다.",
    kpi: "에세이 리서치 및 학회 매거진 기획안 구성",
    outcomes: ["학술 칼럼 리포트", "HIVE 매거진"]
  }
];

export const MAIN_ACTIVITIES: CurriculumItem[] = [
  {
    id: 1,
    title: "로컬 크리에이터 프로젝트",
    period: "1학기",
    description: "지역의 숨겨진 가치를 발굴하고 로컬 비즈니스 모델을 기획하여 지역 관광을 활성화합니다.",
    kpi: "로컬 비즈니스 제안서 완성 및 실무 검토",
    outcomes: ["로컬 크리에이터 로드맵", "프로젝트 포트폴리오"]
  },
  {
    id: 2,
    title: "H&T 학술연구제",
    period: "2학기",
    description: "1년 간의 자유 연구의 성과를 발표하고 공유하는 HIVE만의 학술축제입니다.",
    kpi: "최종 학술 발표 및 우수 연구 3편 시상",
    outcomes: ["학술지", "최종 발표 자료"]
  },
  {
    id: 3,
    title: "미스터리 쇼퍼 프로젝트",
    period: "시즌별",
    description: "호텔, 외식 기업 및 서비스 사업장을 대상으로 암행 평가를 실시하여 서비스 품질을 진단하고 실무적인 개선 전략을 수립합니다.",
    kpi: "서비스 품질 진단 리포트 및 개선 전략 제안서 완성",
    outcomes: ["비밀 감사 리포트", "서비스 블루프린트"]
  }
];

export const MEMBERS: Member[] = [
  {
    id: 1,
    name: "강경임",
    role: "1기 학회장",
    image: "https://i.ibb.co/v6z0pWtm/image.jpg",
    bio: "",
    education: "호텔외식관광학과 24",
    skills: ["관광교육", "호텔경영"],
    contact: "rang4f58@naver.com"
  },
  {
    id: 2,
    name: "고승민",
    role: "YB",
    image: "https://i.ibb.co/ymb9d6wb/4.png",
    bio: "",
    education: "호텔외식관광학과 23",
    skills: ["MICE 경영", "호텔경영"],
    contact: "smko0619@naver.com"
  },
  {
    id: 3,
    name: "김민경",
    role: "PR",
    image: "https://i.ibb.co/TGvX4D7/28.png",
    bio: "",
    education: "호텔외식관광학과 25",
    skills: ["MICE 경영", "호텔경영"],
    contact: "min_0817@naver.com"
  },
  {
    id: 5,
    name: "김성학",
    role: "회계",
    image: "https://i.ibb.co/TGvX4D7/28.png",
    bio: "",
    education: "호텔외식관광학과 24",
    skills: ["MICE 경영", "항공서비스"],
    contact: "ksh0020203@naver.com"
  },
  {
    id: 6,
    name: "김재환",
    role: "YB",
    image: "https://i.ibb.co/v6rTnkYv/Kakao-Talk-20260322-200810881.jpg",
    bio: "",
    education: "호텔관광경영학부 26",
    skills: ["파트너십", "지역관광개발"],
    contact: "TBD"
  },
  {
    id: 7,
    name: "김하경",
    role: "대외협력",
    image: "https://i.ibb.co/mC5PxwhH/image.png",
    bio: "",
    education: "관광항공경영학과 20",
    skills: ["지역관광개발", "항공서비스"],
    contact: "khkzz0802@naver.com",
    isAlumni: true
  },
  {
    id: 8,
    name: "박예은",
    role: "교육",
    image: "https://i.ibb.co/9mTfw9zq/image.jpg",
    bio: "",
    education: "호텔외식관광학과 / 일본어일본학과 22",
    skills: ["국제관광", "지역관광개발"],
    contact: "yeeun8556@naver.com"
  },
  {
    id: 9,
    name: "송진혁",
    role: "YB",
    image: "https://i.ibb.co/S4xLSnSD/2026-08-08-224456.png",
    bio: "",
    education: "호텔외식관광학과 23",
    skills: ["AI", "서비스경영"],
    contact: "TBD"
  },
  {
    id: 10,
    name: "조석기",
    role: "YB",
    image: "https://i.ibb.co/TGvX4D7/28.png",
    bio: "",
    education: "호텔외식관광학과 23",
    skills: ["항공서비스", "호텔경영"],
    contact: "seokgi205@gmail.com"
  },
  {
    id: 11,
    name: "Jeanne Dickey",
    role: "대외협력",
    image: "https://i.ibb.co/TGvX4D7/28.png",
    bio: "",
    education: "호텔외식관광학과 22",
    skills: ["호텔경영", "관광서비스"],
    contact: "TBD",
    isAlumni: true
  },
  {
    id: 12,
    name: "윤시원",
    role: "YB",
    image: YOON_SIWON_IMAGE,
    bio: "",
    education: "호텔외식관광학과 23",
    skills: ["항공경영", "사회복지"],
    contact: "TBD"
  }
];

export const BRAND_STORY = {
  origin: "HIVE는 대구대학교 호텔외식관광학과를 대표하는 호스피탈리티 경영학회로, 서비스 산업의 본질을 탐구하고 변화하는 미래 가치를 공유하기 위해 설립되었습니다.",
  problem: "전통적인 교육과 실무 사이의 연결을 고민하며, 현대 사회의 다양한 접점에서 발생하는 경험을 이해하고 혁신적인 환대의 가치를 제안하는 것이 우리의 목표입니다.",
  difference: "우리는 단순히 지식을 쌓는 데 그치지 않고, 실질적인 프로젝트와 창의적인 기획을 통해 따스한 성품과 전문성을 갖춘 호스피탈리티 리더로서 함께 성장합니다.",
  vision: "환대(Hospitality), 혁신(Innovation), 가치(Value), 경험(Experience) - 이것이 HIVE가 지향하는 본질입니다."
};

export const PARTNER_MEMBERS: Member[] = [
  {
    id: 201,
    name: "김병국",
    role: "교수",
    category: "Professor Group",
    image: "https://i.ibb.co/7tTLfhW9/2026-07-07-003052.png",
    bio: "대구대학교 호텔외식관광학과 교수",
    education: "대구대학교 호텔외식관광학과",
    skills: ["호텔경영", "관광개발"],
    contact: "TBD"
  },
  {
    id: 202,
    name: "김현정",
    role: "교수",
    category: "Professor Group",
    image: "https://i.ibb.co/Z1WTwCSs/2026-07-07-003754.png",
    bio: "대구대학교 호텔외식관광학과 교수",
    education: "대구대학교 호텔외식관광학과",
    skills: ["호텔경영", "관광마케팅"],
    contact: "TBD"
  },
  {
    id: 203,
    name: "송자현",
    role: "교수",
    category: "Professor Group",
    image: "https://i.ibb.co/Z1ph2nV8/2026-07-07-003114.png",
    bio: "대구대학교 호텔외식관광학과 교수",
    education: "대구대학교 호텔외식관광학과",
    skills: ["항공서비스", "MICE"],
    contact: "TBD"
  },
  {
    id: 204,
    name: "박은경",
    role: "교수",
    category: "Professor Group",
    image: "https://i.ibb.co/XZQL4Vbm/2026-06-21-232508.png",
    bio: "대구대학교 호텔외식관광학과 교수",
    education: "대구대학교 호텔외식관광학과",
    skills: ["호텔경영", "식음료 서비스"],
    contact: "TBD"
  },
  {
    id: 13,
    name: "박지호",
    role: "Partner",
    category: "Global Service Group",
    image: "https://i.ibb.co/TGvX4D7/28.png",
    bio: "",
    education: "영어교육과 / 심리학과 24",
    skills: ["항공서비스", "항공경영"],
    contact: "jiho5690@naver.com"
  },
  {
    id: 14,
    name: "전나영",
    role: "Partner",
    category: "Global Service Group",
    image: "https://i.ibb.co/KxdRcy4B/image.jpg",
    bio: "",
    education: "지리교육과 23 / JAS(JEJUAIR SERVICE)",
    skills: ["항공서비스", "지리교육"],
    contact: "pss76@naver.com"
  },
  {
    id: 15,
    name: "송수민",
    role: "Partner",
    category: "Global Service Group",
    image: "https://i.ibb.co/TGvX4D7/28.png",
    bio: "",
    education: "경영학과 25",
    skills: ["항공서비스", "항공경영"],
    contact: "yry8282@naver.com"
  },
  {
    id: 16,
    name: "이시현",
    role: "Partner",
    category: "Global Service Group",
    image: "https://i.ibb.co/TGvX4D7/28.png",
    bio: "",
    education: "간호학과 26",
    skills: ["관광서비스", "항공서비스"],
    contact: "TBD"
  },
  {
    id: 17,
    name: "김예라",
    role: "Partner",
    category: "Global Service Group",
    image: KIM_YERA_IMAGE,
    bio: "",
    education: "영어교육과, 관광항공경영학과",
    skills: ["항공서비스", "항공경영"],
    contact: "TBD"
  },
  {
    id: 18,
    name: "이정현",
    role: "Partner",
    category: "Global Service Group",
    image: "https://i.ibb.co/TGvX4D7/28.png",
    bio: "",
    education: "부산세연고등학교 교사",
    skills: ["호스피탈리티", "네트워킹"],
    contact: "TBD",
    isAlumni: true
  },
  {
    id: 19,
    name: "박유진",
    role: "Partner",
    category: "Global Service Group",
    image: "https://i.ibb.co/Z1Tk4T4L/2026-05-05-160901.png",
    bio: "",
    education: "호텔관광연구실 / 대구관광고등학교 시간강사",
    skills: ["지역관광개발", "항공 & 우주관광"],
    contact: "pyj@daegu.ac.kr",
    experience: [
      "2023. 08 한국관광공사 주관, 국제이벤트 지원사업 전문가 평가단",
      "2024. 08 경상남도 산청군 관광개발 예비사업 연구개발과제 인턴",
      "2026. 04 ~ : 대구관광고등학교 시간강사(관광문화와자원, 웨딩)"
    ]
  },
  {
    id: 20,
    name: "김보민",
    role: "Partner",
    category: "Tourism & AI Group",
    image: "https://i.ibb.co/TGvX4D7/28.png",
    bio: "",
    education: "호텔관광연구실",
    skills: ["인공지능", "스마트관광"],
    contact: "kbm010525@naver.com",
    experience: [
      "2024. 08 경상남도 산청군 관광개발 예비사업 연구개발과제 인턴"
    ]
  }
];

export const FAQS: FAQ[] = [
  {
    question: "어떤 전공이 지원 가능한가요?",
    answer: "학과 지원제한이 없습니다."
  },
  {
    question: "선발 프로세스는 어떻게 되나요?",
    answer: "서류 전형과 면접 전형을 거쳐 최종 선발됩니다. 단순 스펙보다는 학회 활동에 대한 몰입도와 성장 가능성을 중점적으로 평가합니다."
  },
  {
    question: "활동 기간은 어떻게 되나요?",
    answer: "기본적으로 1년(2학기) 활동을 원칙으로 합니다. 이는 프로젝트의 연속성과 심도 있는 성장을 위함입니다."
  }
];

export function getAuthorDisplayGroup(name: string): string {
  if (!name) return '호스피탈리티경영학회원';
  const partner = PARTNER_MEMBERS.find(m => m.name === name);
  if (partner) {
    return partner.category || 'Global Service Group';
  }
  const member = MEMBERS.find(m => m.name === name);
  if (member) {
    return '호스피탈리티경영학회원';
  }
  return '호스피탈리티경영학회원'; // Default fallback
}

