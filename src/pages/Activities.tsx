import React, { useState } from 'react';
import { motion } from 'motion/react';
import { REGULAR_CURRICULUM, MAIN_ACTIVITIES } from '../constants';
import { CheckCircle2, BookOpen, Calendar } from 'lucide-react';
import { WeeklyRoadmap } from '../components/WeeklyRoadmap';

const Activities = () => {
  const [activeTab, setActiveTab] = useState<'TRACKS' | 'ROADMAP'>('TRACKS');

  return (
    <div className="pt-20">
      <section id="program" className="py-24 bg-ivory min-h-[80vh]">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Main Title of Activities Page */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center space-x-2 px-3 py-1 bg-hive-green/5 text-hive-green border border-hive-green/20 text-[10px] font-black rounded-full mb-4 uppercase tracking-widest">
              📘 GST CORE EDUCATION PROGRAM
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-navy-900 mb-4">
              커리큘럼 (Curriculum)
            </h1>
            <p className="text-navy-900/60 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-semibold">
              글로벌 서비스 분석과 스마트 기술 혁신 시나리오 기획을 주도할 차세대 인재 양성을 위한 융합형 교육 체계입니다. 
              학회 핵심 역량에 실무 트렌드를 접목하여 입체적으로 학습합니다.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="bg-white border border-navy-900/5 p-1.5 rounded-2xl flex items-center gap-1.5 mb-12 max-w-md mx-auto shadow-xs">
            <button
              onClick={() => setActiveTab('TRACKS')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 w-full justify-center cursor-pointer ${
                activeTab === 'TRACKS'
                  ? 'bg-hive-green text-white shadow-xs'
                  : 'text-navy-900/50 hover:text-navy-900 hover:bg-hive-green/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>정기 / 메인 활동</span>
            </button>
            <button
              onClick={() => setActiveTab('ROADMAP')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 w-full justify-center cursor-pointer ${
                activeTab === 'ROADMAP'
                  ? 'bg-hive-green text-white shadow-xs'
                  : 'text-navy-900/50 hover:text-navy-900 hover:bg-hive-green/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>주차별 세부 로드맵</span>
            </button>
          </div>

          <div className="space-y-28">
            {/* Conditional Display of Curriculum Content */}
            {activeTab === 'TRACKS' ? (
              /* Regular Curriculum Section */
              <div className="space-y-28">
                <div>
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 text-hive-green">Regular Curriculum</h2>
                    <h3 className="text-lg md:text-xl font-display font-semibold text-accent mb-3 tracking-widest uppercase">정기 활동</h3>
                    <p className="text-navy-900/60 max-w-2xl mx-auto text-sm">HIVE의 전문성을 쌓아가는 정기적인 연구 및 분석 과정입니다.</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {REGULAR_CURRICULUM.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="relative p-10 bg-white rounded-3xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500 border border-navy-900/10"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                          <span className="text-8xl font-display font-black text-navy-900">0{i + 1}</span>
                        </div>
                        
                        <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full mb-6 uppercase tracking-widest">
                          {p.period}
                        </span>
                        
                        <h3 className="text-2xl font-bold mb-4 text-navy-900">{p.title}</h3>
                        <p className="text-navy-900/70 mb-8 text-sm leading-relaxed">{p.description}</p>
                        
                        <div className="mb-8">
                          <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Core KPI</h4>
                          <p className="text-navy-900/80 text-sm font-medium">{p.kpi}</p>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Key Outcomes</h4>
                          {p.outcomes.map((outcome, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm text-navy-900/70">
                              <CheckCircle2 size={14} className="text-accent" />
                              <span>{outcome}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Main Activities Section */}
                <div>
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 text-hive-green">Main Activities</h2>
                    <h3 className="text-lg md:text-xl font-display font-semibold text-accent mb-3 tracking-widest uppercase">메인 활동</h3>
                    <p className="text-navy-900/60 max-w-2xl mx-auto text-sm">실무 역량을 발휘하고 성과를 증명하는 HIVE의 핵심 프로젝트입니다.</p>
                  </div>

                  <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    {MAIN_ACTIVITIES.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="relative p-10 bg-white rounded-3xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500 border border-navy-900/10"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                          <span className="text-8xl font-display font-black text-navy-900">0{i + 1}</span>
                        </div>
                        
                        <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full mb-6 uppercase tracking-widest">
                          {p.period}
                        </span>
                        
                        <h3 className="text-2xl font-bold mb-4 text-navy-900">{p.title}</h3>
                        <p className="text-navy-900/70 mb-8 text-sm leading-relaxed">{p.description}</p>
                        
                        <div className="mb-8">
                          <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Core KPI</h4>
                          <p className="text-navy-900/80 text-sm font-medium">{p.kpi}</p>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Key Outcomes</h4>
                          {p.outcomes.map((outcome, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm text-navy-900/70">
                              <CheckCircle2 size={14} className="text-accent" />
                              <span>{outcome}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Weekly Detailed Roadmap Section with Persistent Firestore DB sync */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <WeeklyRoadmap />
              </motion.div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
};

export default Activities;
