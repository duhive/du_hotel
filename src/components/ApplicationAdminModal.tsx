import React, { useState, useEffect } from 'react';
import { X, Search, Lock, ShieldCheck, User, Mail, Phone, GraduationCap, Calendar, Download, Trash2, Eye, Award, FileText, CheckCircle2, RefreshCw, Filter } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export interface ApplicationData {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  studentId: string;
  motivation: string;
  strengths: string;
  activityProposal?: string;
  interestTrack: string;
  photo: string;
  submittedAt?: any;
  createdAtStr?: string;
}

interface ApplicationAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationAdminModal: React.FC<ApplicationAdminModalProps> = ({ isOpen, onClose }) => {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passError, setPassError] = useState('');
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);

  // Load passcode session state
  useEffect(() => {
    const savedUnlocked = sessionStorage.getItem('hive_app_admin_unlocked');
    if (savedUnlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  // Fetch applications when opened and unlocked
  useEffect(() => {
    if (isOpen && isUnlocked) {
      fetchApplications();
    }
  }, [isOpen, isUnlocked]);

  const fetchApplications = async () => {
    setLoading(true);
    const appList: ApplicationData[] = [];

    // 1. Fetch from Firestore
    try {
      const querySnapshot = await getDocs(collection(db, 'applications'));
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let dateStr = '날짜 정보 없음';
        if (data.submittedAt?.toDate) {
          dateStr = data.submittedAt.toDate().toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        } else if (data.submittedAt) {
          dateStr = new Date(data.submittedAt).toLocaleString('ko-KR');
        }

        appList.push({
          id: docSnap.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          department: data.department || '',
          studentId: data.studentId || '',
          motivation: data.motivation || '',
          strengths: data.strengths || '',
          interestTrack: data.interestTrack || '미지정',
          photo: data.photo || '',
          submittedAt: data.submittedAt,
          createdAtStr: dateStr
        });
      });
    } catch (err) {
      console.warn('Firestore fetch applications notice:', err);
    }

    // 2. Merge with LocalStorage backup
    try {
      const savedLocal = localStorage.getItem('hive_applications');
      if (savedLocal) {
        const parsedLocal: ApplicationData[] = JSON.parse(savedLocal);
        parsedLocal.forEach(localItem => {
          if (!appList.some(item => item.id === localItem.id || (item.studentId === localItem.studentId && item.name === localItem.name))) {
            appList.push(localItem);
          }
        });
      }
    } catch (e) {
      console.error('LocalStorage parse error:', e);
    }

    // Sort by newest
    appList.sort((a, b) => {
      const timeA = a.submittedAt?.seconds ? a.submittedAt.seconds * 1000 : new Date(a.createdAtStr || 0).getTime();
      const timeB = b.submittedAt?.seconds ? b.submittedAt.seconds * 1000 : new Date(b.createdAtStr || 0).getTime();
      return timeB - timeA;
    });

    setApplications(appList);
    setLoading(false);
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === '2405') {
      setIsUnlocked(true);
      sessionStorage.setItem('hive_app_admin_unlocked', 'true');
      setPassError('');
      setPasscode('');
    } else {
      setPassError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleDelete = async (appId: string) => {
    if (window.confirm('정말로 이 지원서를 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'applications', appId));
      } catch (e) {
        console.warn('Firestore delete note:', e);
      }

      // Delete from local
      const savedLocal = localStorage.getItem('hive_applications');
      if (savedLocal) {
        try {
          const parsed: ApplicationData[] = JSON.parse(savedLocal);
          const filtered = parsed.filter(item => item.id !== appId);
          localStorage.setItem('hive_applications', JSON.stringify(filtered));
        } catch (err) {}
      }

      setApplications(prev => prev.filter(item => item.id !== appId));
      if (selectedApp?.id === appId) {
        setSelectedApp(null);
      }
    }
  };

  const handleDownloadPhoto = (photoUrl: string, name: string, studentId: string) => {
    if (!photoUrl) return;
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = `HIVE_프로필_${name}_${studentId || '지원자'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleClearAll = async () => {
    if (applications.length === 0) {
      alert('삭제할 지원서 데이터가 없습니다.');
      return;
    }
    if (window.confirm(`현재 등록된 총 ${applications.length}건의 모든 지원서 데이터를 삭제하시겠습니까? 이 작업은 복구할 수 없습니다.`)) {
      setLoading(true);
      for (const app of applications) {
        try {
          await deleteDoc(doc(db, 'applications', app.id));
        } catch (e) {
          console.warn('Firestore delete error:', e);
        }
      }
      localStorage.removeItem('hive_applications');
      setApplications([]);
      setSelectedApp(null);
      setLoading(false);
      alert('모든 지원서 데이터가 성공적으로 지워졌습니다.');
    }
  };

  if (!isOpen) return null;

  // Filter logic
  const filteredApps = applications.filter(app => {
    const matchesQuery = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone.includes(searchQuery) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTrack = selectedTrack === 'all' || app.interestTrack.includes(selectedTrack);
    return matchesQuery && matchesTrack;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-hive-green text-white rounded-2xl flex items-center justify-center font-bold shadow-md shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">학회원 입회 지원서 관리자 시스템</h2>
                <span className="px-2.5 py-0.5 bg-hive-green/10 text-hive-green rounded-full text-[11px] font-extrabold uppercase">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">실시간 대구대 HIVE 신입 학회원 지원자 명단 및 서류 조회</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        {!isUnlocked ? (
          /* Passcode Form view */
          <div className="py-12 px-4 text-center max-w-md mx-auto my-auto space-y-6">
            <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
              <Lock size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">관리자 접근 인증</h3>
              <p className="text-xs text-slate-500 mt-1">학회원 입회 지원서 정보를 확인하려면 관리자 암호를 입력해 주세요.</p>
            </div>

            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="관리자 암호 입력"
                  maxLength={10}
                  autoFocus
                  className="w-full text-center tracking-[0.3em] font-mono text-xl py-3 px-4 rounded-xl border border-slate-200 focus:border-hive-green focus:outline-none bg-slate-50 font-bold"
                />
                {passError && (
                  <p className="text-xs font-semibold text-red-500 mt-2">{passError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-hive-green hover:bg-hive-green/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
              >
                잠금 해제
              </button>
            </form>
          </div>
        ) : (
          /* Main Unlocked Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden pt-4 space-y-4">
            
            {/* Top Toolbar: Search & Refresh & Stats */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 shrink-0">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="이름, 학번, 학과, 연락처, 접수번호 검색..."
                    className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 focus:border-hive-green focus:outline-none text-xs font-sans"
                  />
                </div>

                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="py-2 px-3 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">전체 관심 분야</option>
                  <option value="관광">관광 / 호스피탈리티 / 호텔</option>
                  <option value="무역">무역학 / 국제통상</option>
                  <option value="미디어">미디어 / 언론 / 방송</option>
                  <option value="마케팅">마케팅 / 브랜딩 / PR</option>
                  <option value="경영">경영학 / 회계 / 재무</option>
                  <option value="핀테크">핀테크 / 금융 / 투자</option>
                  <option value="반도체">반도체 / 디스플레이</option>
                  <option value="AI">AI / 빅데이터 / IT</option>
                  <option value="디자인">디자인 / UX·UI</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2">
                <div className="text-xs font-bold text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200 font-mono">
                  총 지원자: <span className="text-hive-green font-extrabold text-sm">{filteredApps.length}</span> 명
                </div>
                
                <button
                  onClick={fetchApplications}
                  className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  title="새로고침"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>

                <button
                  onClick={handleClearAll}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                  title="전체 지원자 초기화"
                >
                  <Trash2 size={14} /> 전체 삭제
                </button>
              </div>
            </div>

            {/* List View */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[300px]">
              {loading ? (
                <div className="py-20 text-center text-slate-400 space-y-3">
                  <RefreshCw size={24} className="animate-spin mx-auto text-hive-green" />
                  <p className="text-xs font-bold">지원자 데이터를 불러오는 중입니다...</p>
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 my-4">
                  <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-600">등록된 입회 지원서가 없거나 검색 결과가 없습니다.</p>
                  <p className="text-xs text-slate-400 mt-1">홈페이지 [JOIN] 메뉴에서 지원서를 작성하면 이곳에 실시간으로 표시됩니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredApps.map((app) => (
                    <div 
                      key={app.id} 
                      className="p-4 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/80 shadow-2xs transition-all hover:border-hive-green/40 flex flex-col justify-between space-y-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative group/photo shrink-0">
                          {app.photo ? (
                            <img 
                              src={app.photo} 
                              alt={app.name} 
                              className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                              <User size={24} />
                            </div>
                          )}
                          {app.photo && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadPhoto(app.photo, app.name, app.studentId);
                              }}
                              className="absolute -bottom-1 -right-1 p-1 bg-hive-green text-white rounded-md hover:scale-110 transition-all cursor-pointer shadow-sm"
                              title="프로필 다운로드"
                            >
                              <Download size={10} />
                            </button>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h4 className="text-sm font-black text-slate-900 truncate">{app.name}</h4>
                              <span className="text-xs font-mono font-bold text-slate-500">({app.studentId})</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md shrink-0">
                              {app.id}
                            </span>
                          </div>

                          <p className="text-xs font-medium text-slate-600 truncate mb-1">
                            {app.department}
                          </p>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="px-2 py-0.5 bg-hive-green/10 text-hive-green font-bold rounded-md truncate max-w-[180px]">
                              {app.interestTrack}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info footer */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{app.createdAtStr || '제출됨'}</span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="px-3 py-1 bg-hive-green text-white font-sans font-bold text-xs rounded-lg hover:bg-hive-green/90 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Eye size={12} /> 상세보기
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Admin Bar */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 shrink-0">
              <span className="text-[11px]">대구대학교 호스피탈리티 경영학회 HIVE 지원서 보관함</span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Individual Applicant Detailed View Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setSelectedApp(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-hive-green text-white font-bold text-xs rounded-full uppercase tracking-wider font-mono">
                {selectedApp.id}
              </span>
              <span className="text-xs text-slate-400 font-mono">제출일시: {selectedApp.createdAtStr}</span>
            </div>

            {/* Top Profile Card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
              <div className="flex flex-col items-center gap-2 shrink-0">
                {selectedApp.photo ? (
                  <img 
                    src={selectedApp.photo} 
                    alt={selectedApp.name} 
                    className="w-24 h-24 object-cover rounded-2xl border-2 border-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-24 h-24 bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm">
                    <User size={40} />
                  </div>
                )}
                {selectedApp.photo && (
                  <button
                    type="button"
                    onClick={() => handleDownloadPhoto(selectedApp.photo, selectedApp.name, selectedApp.studentId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-hive-green text-white font-bold text-[11px] rounded-lg hover:bg-hive-green/90 transition-all cursor-pointer shadow-2xs mt-1"
                  >
                    <Download size={13} /> 프로필 다운로드
                  </button>
                )}
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl font-black text-slate-900">{selectedApp.name}</h3>
                  <span className="text-sm font-bold font-mono text-slate-500">({selectedApp.studentId})</span>
                </div>

                <div className="text-xs font-semibold text-slate-700 flex items-center justify-center sm:justify-start gap-1">
                  <GraduationCap size={14} className="text-hive-green" /> {selectedApp.department}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 pt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" /> {selectedApp.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail size={12} className="text-slate-400" /> {selectedApp.email}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-hive-green/10 text-hive-green font-bold text-xs rounded-lg">
                    희망 관심 분야: {selectedApp.interestTrack}
                  </span>
                </div>
              </div>
            </div>

            {/* Essay Sections */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileText size={15} className="text-hive-green" /> 1. 지원 동기
                </h4>
                <div className="p-4 bg-slate-50 rounded-2xl text-xs md:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line border border-slate-100 min-h-[80px]">
                  {selectedApp.motivation || '작성 내용 없음'}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Award size={15} className="text-hive-green" /> 2. 본인의 강점 및 관련 경험
                </h4>
                <div className="p-4 bg-slate-50 rounded-2xl text-xs md:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line border border-slate-100 min-h-[80px]">
                  {selectedApp.strengths || '작성 내용 없음'}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileText size={15} className="text-hive-green" /> 3. 희망 학회 활동 및 아이디어 제안
                </h4>
                <div className="p-4 bg-slate-50 rounded-2xl text-xs md:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line border border-slate-100 min-h-[80px]">
                  {selectedApp.activityProposal || '작성 내용 없음 (선택 작성)'}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedApp.id)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={14} /> 지원서 삭제
              </button>

              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
