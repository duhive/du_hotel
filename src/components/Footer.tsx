import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Globe, Lock } from 'lucide-react';
import { VisitorAnalyticsModal } from './VisitorAnalyticsModal';

const Footer = () => {
  const [clickCount, setClickCount] = useState(0);
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  const handleSecretClick = () => {
    if (clickTimer) clearTimeout(clickTimer);

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount >= 5) {
      setIsVisitorModalOpen(true);
      setClickCount(0);
    } else {
      const timer = setTimeout(() => {
        setClickCount(0);
      }, 3000);
      setClickTimer(timer);
    }
  };

  return (
    <footer className="bg-white text-navy-900 py-16 border-t border-navy-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-hive-green flex items-center justify-center text-white font-bold rounded-sm">H</div>
              <span className="text-xl font-bold tracking-tight text-hive-green">
                HI<span className="inline-block scale-x-[0.8] origin-center -mx-[0.02em]">V</span>E
              </span>
            </Link>
            <p className="text-navy-900/40 max-w-sm text-sm leading-relaxed mb-8">
              Daegu University Hospitality Management Society. <br/>
              환대의 본질을 연구하고 가치 있는 경험을 제안합니다. 당신의 가능성을 함께 만들어가는 학업적 공동체입니다.
            </p>
            <div className="flex space-x-6 items-center">
              <a 
                href="https://www.instagram.com/du_hive/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-navy-900/30 hover:text-hive-green transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <Instagram size={18} />
                <span className="text-xs uppercase tracking-widest font-bold">Instagram</span>
              </a>
              <a href="#" className="text-navy-900/30 hover:text-hive-green transition-colors flex items-center space-x-2 cursor-pointer">
                <Linkedin size={18} />
                <span className="text-xs uppercase tracking-widest font-bold">LinkedIn</span>
              </a>
              <a href="#" className="text-navy-900/30 hover:text-hive-green transition-colors flex items-center space-x-2 cursor-pointer">
                <Globe size={18} />
                <span className="text-xs uppercase tracking-widest font-bold">Blog</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-hive-green font-bold mb-6">Navigation</h4>
            <ul className="space-y-4 text-sm text-navy-900/60">
              <li><Link to="/about" className="hover:text-hive-green transition-colors">About</Link></li>
              <li><Link to="/activities" className="hover:text-hive-green transition-colors">Program</Link></li>
              <li><Link to="/members" className="hover:text-hive-green transition-colors">Members</Link></li>
              <li><Link to="/join" className="hover:text-hive-green transition-colors">Recruit</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-hive-green font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-navy-900/60">
              <li>Daegu University, Gyeongsan, Korea</li>
              <li>Hospitality Management Dept.</li>
              <li>duhospitality@naver.com</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-navy-900/10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-navy-900/30 font-bold">
          <div className="flex items-center gap-2 select-none">
            <span 
              onClick={handleSecretClick}
              className="cursor-pointer hover:text-navy-900/60 transition-colors"
              title="비밀 대시보드 (5회연속 클릭)"
            >
              © 2026 HIVE. All Rights Reserved.
            </span>
            <button
              onClick={() => setIsVisitorModalOpen(true)}
              className="p-1 opacity-20 hover:opacity-100 hover:text-hive-green transition-all cursor-pointer"
              title="비밀 방문자 분석 보기"
            >
              <Lock size={10} />
            </button>
          </div>
          <p className="mt-4 md:mt-0">Hospitality Management Society</p>
        </div>
      </div>

      {/* Secret Visitor Analytics Modal */}
      <VisitorAnalyticsModal 
        isOpen={isVisitorModalOpen}
        onClose={() => setIsVisitorModalOpen(false)}
      />
    </footer>
  );
};

export default Footer;
