import React from 'react';
import { motion } from 'motion/react';
import { BRAND_STORY } from '../constants';

const About = () => {
  const features = [
    { icon: <span className="text-3xl font-display font-bold text-accent">H</span>, title: "Hospitality", desc: "호스피탈리티 산업의 본질을 탐구하고 전문성을 구축합니다." },
    { icon: <span className="text-3xl font-display font-bold text-accent">I</span>, title: "Innovation", desc: "디지털 기술뿐만 아니라 관광호스피탈리티 산업의 전방위적인 혁신을 추구합니다." },
    { icon: <span className="text-3xl font-display font-bold text-accent inline-block scale-x-[0.8] transform origin-center">V</span>, title: "Value", desc: "이종 산업 간의 융합을 통해 차별화된 비즈니스 가치를 창출합니다." },
    { icon: <span className="text-3xl font-display font-bold text-accent">E</span>, title: "Experience", desc: "고객의 여정과 감동을 설계하는 차별화된 경험 비즈니스를 지향합니다." },
  ];

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Background Mascot Image */}
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none z-0 select-none">
        <img 
          src="https://upload.wikimedia.org/wikipedia/ko/thumb/2/2a/%EB%8C%80%EA%B5%AC%EB%8C%80%ED%95%99%EA%B5%90_%EC%BA%90%EB%A6%AD%ED%84%B0_%EB%91%90%EB%8B%88.png/800px-%EB%8C%80%EA%B5%AC%EB%8C%80%ED%95%99%EA%B5%90_%EC%BA%90%EB%A6%AD%ED%84%B0_%EB%91%90%EB%8B%88.png" 
          alt="Daegu University Mascot" 
          className="w-[600px] h-auto grayscale"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 text-hive-green">
              About Us
            </h2>
            <div className="space-y-6 text-navy-900/70 leading-relaxed text-lg">
              <p>{BRAND_STORY.origin}</p>
              <p>{BRAND_STORY.problem}</p>
              <p>{BRAND_STORY.difference}</p>
              <p className="text-accent font-semibold">{BRAND_STORY.vision}</p>
            </div>
          </motion.div>

          <div className="relative">
            {/* Single Large Watermark Behind the entire grid */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.25] pointer-events-none select-none z-0">
              <img 
                src="https://i.ibb.co/Rpk7MTKP/3.png" 
                alt="Large HIVE Watermark" 
                className="w-80 h-80 md:w-[480px] md:h-[480px] object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-white/40 border border-navy-900/5 rounded-2xl hover:border-accent/40 transition-all duration-300 group shadow-sm hover:shadow-md relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {f.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-navy-900">{f.title}</h3>
                    <p className="text-sm text-navy-900/40">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>


        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative py-12"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-hive-green">Scope of Activities</h2>
            <p className="text-navy-900/60 max-w-2xl mx-auto text-lg">
              HIVE는 전통적인 호스피탈리티 전문성과 현대적인 융복합 분야를 결합하여 산업의 경계를 확장합니다.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
            {/* Traditional Block */}
            <div className="relative p-10 border border-navy-900/10 rounded-[2.5rem] w-full max-w-sm bg-white shadow-sm">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-hive-green text-white px-6 py-2 font-bold text-[10px] uppercase tracking-[0.2em] rounded-full shadow-lg whitespace-nowrap">
                Traditional Hospitality
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { name: "Aviation", color: "bg-hive-green/5 text-hive-green" },
                  { name: "Food Service", color: "bg-hive-green/5 text-hive-green" },
                  { name: "Hotel", color: "bg-hive-green/5 text-hive-green" },
                  { name: "Convention", color: "bg-hive-green/5 text-hive-green" }
                ].map((item, idx) => (
                  <div key={idx} className={`aspect-square ${item.color} rounded-2xl flex items-center justify-center text-center p-4 border border-hive-green/10 hover:bg-hive-green hover:text-white transition-all duration-300 group`}>
                    <span className="font-bold text-xs md:text-sm uppercase tracking-wider">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plus Sign */}
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-hive-green rounded-2xl flex items-center justify-center shadow-xl transform rotate-45">
                <div className="text-white text-3xl md:text-4xl font-bold transform -rotate-45">+</div>
              </div>
            </div>

            {/* Convergence Block */}
            <div className="relative p-10 border border-navy-900/10 rounded-[2.5rem] w-full max-w-sm bg-white shadow-sm">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-hive-green text-white px-6 py-2 font-bold text-[10px] uppercase tracking-[0.2em] rounded-full shadow-lg whitespace-nowrap">
                Convergence Fields
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { name: "Entertainment", color: "bg-hive-green/5 text-hive-green" },
                  { name: "Fintech", color: "bg-hive-green/5 text-hive-green" },
                  { name: "IT · AI", color: "bg-hive-green/5 text-hive-green" },
                  { name: "Service Design", color: "bg-hive-green/5 text-hive-green" }
                ].map((item, idx) => (
                  <div key={idx} className={`aspect-square ${item.color} rounded-2xl flex items-center justify-center text-center p-4 border border-hive-green/10 hover:bg-hive-green hover:text-white transition-all duration-300 group`}>
                    <span className="font-bold text-xs md:text-sm uppercase tracking-wider">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
