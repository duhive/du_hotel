import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';

interface GalleryImage {
  id: number;
  title: string;
  category: string;
  date: string;
  description: string;
  url: string;
  urls?: string[];
  location: string;
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 4,
    title: "호스피탈리티 세미나(2)",
    category: "Regular Curriculums",
    date: "2026.03.14",
    description: `관광 및 호스피탈리티 산업의 다각화된 국외 이슈와 최신 전략적 흐름을 분석하고 연구 발표를 진행했습니다.

주요 연구 분석 주제:
• 자본의 역외 수출 현상과 상생 전략
• 문화유산 자원과 관광수요의 활성화 상관관계
• 일본 '스마도리(スマドリ)' 문화 확산에 따른 주류 시장 분석
• 서비스 직군의 노동 환경이 직무만족과 이직의도에 미치는 영향
• 유가 등 대외 요인 조성이 국제 관광 경제에 주는 피드백

폭넓은 토의를 거치며 글로벌 비즈니스 인사이트를 단단히 다지는 지식 교류의 장을 마련했습니다.`,
    url: "https://i.ibb.co/4nfnKKkj/Kakao-Talk-20260507-182539464-08.jpg",
    urls: [
      "https://i.ibb.co/4nfnKKkj/Kakao-Talk-20260507-182539464-08.jpg",
      "https://i.ibb.co/HDJWNNXB/image4.png",
      "https://i.ibb.co/zVCVtKLS/image3.png"
    ],
    location: "경영 1관 1318c"
  },
  {
    id: 5,
    title: "호스피탈리티 세미나(1)",
    category: "Idea Ideation",
    date: "2026.04.06",
    description: `지난 4월 6일(월) 16:30, '관심 있는 관광 분야 조사 및 발표'를 주제로 세미나가 진행되었습니다.

각 학회원이 지속 가능한 관광, AI·스마트 관광, 지역 관광, 축제 및 이벤트 관광, 관광 상품 및 서비스 경험 등 다양한 주제에 대해 2~3분간 자유로운 발표를 펼치고, 가벼운 대화와 질의응답을 통해 폭넓은 시각과 인사이트를 나누었습니다.

앞으로도 활발한 상호 지식 공유와 학습을 통해 구성원 모두가 주도적으로 성장할 수 있는 풍성한 세미나를 이어가겠습니다.`,
    url: "https://i.ibb.co/tpGm5dsZ/Kakao-Talk-20260407-184041137-05.jpg",
    urls: [
      "https://i.ibb.co/tpGm5dsZ/Kakao-Talk-20260407-184041137-05.jpg"
    ],
    location: "경영 1관 1318c"
  },
  {
    id: 6,
    title: "호스피탈리티 경영학회 OT",
    category: "Human Network",
    date: "2026.03.30",
    description: `안녕하십니까. 대구대학교 호텔관광외식서비스전공 호스피탈리티 경영학회 HIVE입니다.

지난 2026년 3월 30일, 많은 학회원분들의 성원 속에서 HIVE 학회 오리엔테이션(OT)이 성공적으로 개최되었습니다. 이번 오리엔테이션을 통해 HIVE의 핵심 가치와 학술 비전은 물론, 앞으로 함께 만들어갈 알차고 유익한 활동 계획들을 활기차게 나누었습니다.

특히 지도교수님과 함께한 대화 시간을 통해 호스피탈리티 산업에 관한 현장 통찰과 실무 커리어 조언을 나누는 뜻깊고 유익한 시간을 보냈습니다.

앞으로도 다채롭고 내실 있는 활동들을 통해 학회원 개개인의 실무 역량을 고양하고, 서로 수혈하고 격려하며 함께 주체적으로 성장해 나가는 HIVE가 되겠습니다.`,
    url: "https://i.ibb.co/Mx4Yw4nk/image.png",
    urls: [
      "https://i.ibb.co/Mx4Yw4nk/image.png",
      "https://i.ibb.co/8LxTxT0F/image1.png"
    ],
    location: "경영 1관 1318c"
  }
];

const Photo = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const handlePrev = (urlsLength: number) => {
    setCurrentImgIndex((prev) => (prev === 0 ? urlsLength - 1 : prev - 1));
  };

  const handleNext = (urlsLength: number) => {
    setCurrentImgIndex((prev) => (prev === urlsLength - 1 ? 0 : prev + 1));
  };

  return (
    <div className="pt-20">
      <section className="py-24 bg-white min-h-[80vh]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader 
            title="Photo Gallery"
            subtitle="포토 갤러리"
          />

          <div id="gallery-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {GALLERY_IMAGES.map((image, i) => (
              <motion.div
                id={`gallery-card-${image.id}`}
                key={image.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -6 }}
                onClick={() => {
                  setSelectedImage(image);
                  setCurrentImgIndex(0);
                }}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy-900/5 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-navy-900/5"
              >
                <img 
                  src={image.url}
                  alt={image.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual Text Panel Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-lg font-bold leading-tight line-clamp-1 mb-1 transition-colors duration-300 group-hover:text-hive-green">
                    {image.title}
                  </h3>
                  <span className="text-[10px] text-white/50 font-mono tracking-wider font-semibold">
                    {image.date}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Showcase Modal / Page Overlays */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            id="photo-details-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/90 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              id="photo-details-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-auto max-h-[90vh] text-navy-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image View Section (Left Side) */}
              <div className="relative w-full lg:w-3/5 bg-navy-950 flex flex-col justify-center overflow-hidden aspect-[4/3] lg:aspect-auto">
                <motion.img
                  key={currentImgIndex}
                  src={(selectedImage.urls || [selectedImage.url])[currentImgIndex]}
                  alt={`${selectedImage.title} - ${currentImgIndex + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                
                {/* Back / Next Navigation Helpers within image view */}
                {(selectedImage.urls || [selectedImage.url]).length > 1 && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button
                      onClick={() => handlePrev((selectedImage.urls || [selectedImage.url]).length)}
                      className="p-3 rounded-full bg-black/60 hover:bg-hive-green text-white transition-all pointer-events-auto transform active:scale-90 hover:scale-105 cursor-pointer"
                      aria-label="Previous Image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => handleNext((selectedImage.urls || [selectedImage.url]).length)}
                      className="p-3 rounded-full bg-black/60 hover:bg-hive-green text-white transition-all pointer-events-auto transform active:scale-90 hover:scale-105 cursor-pointer"
                      aria-label="Next Image"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {/* Dots indicator */}
                {(selectedImage.urls || [selectedImage.url]).length > 1 && (
                  <div className="absolute bottom-4 inset-x-0 flex justify-center space-x-1.5 z-10 pointer-events-none">
                    {(selectedImage.urls || [selectedImage.url]).map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          dotIdx === currentImgIndex
                            ? 'bg-hive-green w-3'
                            : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}

              </div>

              {/* Information View Section (Right Side) */}
              <div className="w-full lg:w-2/5 p-8 lg:p-10 flex flex-col justify-between bg-white overflow-y-auto max-h-full">
                {/* Close Button */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-mono text-navy-900/40 tracking-wider font-semibold">
                    Gallery Detail View
                  </span>
                  <button
                    id="close-modal-btn"
                    onClick={() => setSelectedImage(null)}
                    className="p-2 text-navy-900/40 hover:text-red-500 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Main Text Content */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-display font-bold leading-snug tracking-tight text-navy-900">
                      {selectedImage.title}
                    </h2>
                  </div>

                  <p className="text-navy-900/70 text-sm leading-relaxed whitespace-pre-line text-justify font-normal">
                    {selectedImage.description}
                  </p>

                  <hr className="border-navy-900/10" />

                  {/* Metadata fields */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-1 rounded-md bg-navy-900/5 text-hive-green flex-shrink-0">
                        <Calendar size={15} />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-navy-900/40 mb-0.5">활동 일시</h4>
                        <p className="text-xs font-medium text-navy-900/80">{selectedImage.date}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="p-1 rounded-md bg-navy-900/5 text-hive-green flex-shrink-0">
                        <MapPin size={15} />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-navy-900/40 mb-0.5">진행 장소</h4>
                        <p className="text-xs font-medium text-navy-900/80">{selectedImage.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer buttons for cycling images inside modal */}
                <div className="mt-8 pt-6 border-t border-navy-900/5 flex justify-between items-center">
                  <button
                    onClick={() => handlePrev((selectedImage.urls || [selectedImage.url]).length)}
                    disabled={(selectedImage.urls || [selectedImage.url]).length <= 1}
                    className={`flex items-center space-x-1.5 text-xs font-medium group cursor-pointer transition-colors ${
                      (selectedImage.urls || [selectedImage.url]).length <= 1
                        ? 'text-navy-900/20 cursor-default'
                        : 'text-navy-900/50 hover:text-hive-green'
                    }`}
                  >
                    <ChevronLeft size={14} className="transform group-hover:-translate-x-0.5 transition-transform" />
                    <span>이전 사진</span>
                  </button>
                  <span className="text-[11px] font-semibold text-navy-900/20 font-mono">
                    {currentImgIndex + 1} / {(selectedImage.urls || [selectedImage.url]).length}
                  </span>
                  <button
                    onClick={() => handleNext((selectedImage.urls || [selectedImage.url]).length)}
                    disabled={(selectedImage.urls || [selectedImage.url]).length <= 1}
                    className={`flex items-center space-x-1.5 text-xs font-medium group cursor-pointer transition-colors ${
                      (selectedImage.urls || [selectedImage.url]).length <= 1
                        ? 'text-navy-900/20 cursor-default'
                        : 'text-navy-900/50 hover:text-hive-green'
                    }`}
                  >
                    <span>다음 사진</span>
                    <ChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Photo;
