import React from 'react';
import { motion } from 'motion/react';
import { Users, Megaphone, BookOpen, Globe } from 'lucide-react';

const Organization = () => {
  const departments = [
    {
      title: '회장단 (Presidential Team)',
      icon: <Users className="w-8 h-8 text-hive-green" />,
      description: '학회의 전반적인 운영을 총괄하며 비전과 전략을 수립합니다. 학회원들의 성장을 지원하고 대내외적인 의사결정을 담당합니다.',
      tasks: [
        '학회 운영 전략 수립 및 실행',
        '학회원 관리 및 커뮤니티 활성화',
        '주요 행사 기획 및 총괄',
        '예산 편성 및 집행 관리'
      ]
    },
    {
      title: 'PR (Public Relations)',
      icon: <Megaphone className="w-8 h-8 text-hive-green" />,
      description: 'HIVE의 가치와 활동을 대내외에 알리는 역할을 수행합니다. 브랜딩 전략을 수립하고 다양한 채널을 통해 소통합니다.',
      tasks: [
        '학회 공식 SNS 채널 운영 및 관리',
        '홍보 콘텐츠(카드뉴스, 영상 등) 기획 및 제작',
        '학회 브랜딩 및 디자인 가이드라인 수립',
        '리크루팅 홍보 캠페인 진행'
      ]
    },
    {
      title: '연구 (학술편집)',
      icon: <BookOpen className="w-8 h-8 text-hive-green" />,
      description: '호스피탈리티 산업의 최신 트렌드를 분석하고 학술적 깊이를 더합니다. 정기적인 리서치와 교육 커리큘럼을 설계합니다.',
      tasks: [
        '산업 트렌드 리서치 및 분석 보고서 발간',
        '학술 세미나 및 교육 커리큘럼 기획',
        '학회 공식 저널/뉴스레터 편집 및 발행',
        '내부 스터디 및 지식 공유 세션 운영'
      ]
    },
    {
      title: '대외협력 (External Cooperation)',
      icon: <Globe className="w-8 h-8 text-hive-green" />,
      description: '외부 기관, 기업, 타 학회와의 네트워크를 구축하고 협업 기회를 창출합니다. 실무 전문가와의 연결고리 역할을 합니다.',
      tasks: [
        '산학협력 프로젝트 및 기업 연계 활동 기획',
        '외부 전문가 초청 강연 및 네트워킹 데이 주관',
        '타 대학/학회와의 교류 프로그램 운영',
        '스폰서십 유치 및 파트너십 관리'
      ]
    }
  ];

  return (
    <div className="pt-20 min-h-screen bg-ivory">
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h4 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-hive-green font-bold tracking-widest text-xs uppercase mb-4"
            >
              Structure
            </motion.h4>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold tracking-tight text-navy-900 mb-6"
            >
              Organization
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-navy-900/70 max-w-2xl mx-auto"
            >
              HIVE는 체계적인 조직 구성을 통해 각 분야의 전문성을 극대화하고,<br/>
              학회원들이 실무적인 역량을 쌓을 수 있는 환경을 제공합니다.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {departments.map((dept, index) => (
              <motion.div
                key={dept.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-navy-900/10 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-hive-green/10 rounded-2xl">
                    {dept.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-navy-900">{dept.title}</h3>
                </div>
                <p className="text-navy-900/70 mb-8 leading-relaxed">
                  {dept.description}
                </p>
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-navy-900/40 uppercase tracking-widest">Key Responsibilities</h4>
                  <ul className="space-y-2">
                    {dept.tasks.map((task, i) => (
                      <li key={i} className="flex items-start space-x-3 text-navy-900/80">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-hive-green rounded-full flex-shrink-0" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Organization;
