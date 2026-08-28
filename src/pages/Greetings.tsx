import React from 'react';
import { motion } from 'motion/react';

const Greetings = () => {
  return (
    <div className="pt-20 bg-slate-50/40 min-h-screen">
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white border border-slate-100 rounded-3xl p-8 md:p-14 shadow-sm relative overflow-hidden"
            id="greetings-card"
          >
            {/* Top decorative accent line */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-hive-green" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Photo & Title */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
                <div className="w-full max-w-[260px] aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-md relative select-none" onContextMenu={(e) => e.preventDefault()}>
                  <img 
                    src="https://i.ibb.co/v6z0pWtm/image.jpg" 
                    alt="President 강경임" 
                    className="w-full h-full object-cover pointer-events-none select-none"
                    referrerPolicy="no-referrer"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div className="absolute inset-0 bg-transparent select-none pointer-events-auto" onContextMenu={(e) => e.preventDefault()} />
                </div>
                
                <div className="mt-6 text-center lg:text-left">
                  <span className="text-[10px] font-bold text-hive-green uppercase tracking-widest block mb-1">
                    Hospitality Innovation Lead
                  </span>
                  <h3 className="text-lg font-bold text-navy-900">강경임</h3>
                  <p className="text-navy-900/50 text-xs mt-1">대구대학교 호텔외식관광학과 · HIVE 1기 학회장</p>
                </div>
              </div>

              {/* Right Column: Greetings Letter */}
              <div className="lg:col-span-8 flex flex-col justify-between h-full">
                <div>
                  <span className="text-hive-green text-[11px] font-bold tracking-widest uppercase block mb-2">
                    Greetings from President
                  </span>
                  
                  <div className="flex items-baseline space-x-3 mb-8 border-b border-slate-100 pb-4">
                    <h1 className="text-3xl font-bold text-navy-900 tracking-tight">강경임</h1>
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                      President's Message
                    </span>
                  </div>

                  {/* Letter Body */}
                  <div className="space-y-6 text-navy-900/80 leading-relaxed text-sm md:text-base font-normal">
                    <p>
                      안녕하십니까, HIVE 학회 홈페이지를 찾아주신 여러분을 진심으로 환영합니다.
                    </p>
                    <p>
                      우리가 살고 있는 현대 사회는 서비스의 질적 가치와 다양한 산업의 혁신적 가치가 하나로 연결되는 거대한 변혁의 시기를 맞이하고 있습니다. 호스피탈리티 산업과 스마트 기술의 결합, 고객의 다차원적 니즈를 반영한 고도화된 서비스 설계, 학문적 경계를 넘나드는 새로운 융합 비즈니스 등 오늘날 모든 산업군은 끊임없는 혁신을 요구받고 있습니다.
                    </p>
                    <p>
                      HIVE는 이러한 시대적 요구에 맞서 전통적인 관광과 호텔 경영, 서비스 학문에만 머무르지 않고, <span className="text-hive-green font-bold border-b-2 border-hive-green/20 pb-0.5">다학제적 지식</span>을 입체적으로 융합합니다. 각자의 도메인 전문 지식에 현대적인 서비스 이론과 호스피탈리티 최신 트렌드를 접목하여 그 누구도 모방할 수 없는 새로운 가치를 연구하고 설계합니다.
                    </p>
                    <p>
                      또한, HIVE는 단순히 지식을 습득하는 데 그치지 않고 학회원들이 각자의 독창적인 가치를 당당히 브랜딩할 수 있도록 돕는 <span className="text-hive-green font-bold border-b-2 border-hive-green/20 pb-0.5">Personal Branding 프로그램</span>을 통해 리더로서의 진정한 출발을 함께합니다.
                    </p>
                    <p>
                      글로벌 서비스 패러다임의 최전선에서 호스피탈리티 가치의 동행을 이끌어갈 우리의 빛나는 도전과 학술적 성장에 따뜻한 성원과 협력을 부탁드립니다. 감사합니다.
                    </p>
                  </div>
                </div>

                {/* Footer Signature Block */}
                <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase block mb-1">
                      HIVE President Office
                    </span>
                    <span className="text-navy-900/70 text-xs font-semibold">
                      호스피탈리티 경영학회 학회장
                    </span>
                  </div>
                  
                  <div className="text-right sm:text-right flex items-center space-x-3">
                    <span className="font-bold text-lg text-navy-900 tracking-wider font-sans block">
                      강경임
                    </span>
                    <span className="font-signature text-3xl text-hive-green/90 select-none transform -rotate-3 inline-block">
                      Kyung-im Kang
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
};

export default Greetings;

