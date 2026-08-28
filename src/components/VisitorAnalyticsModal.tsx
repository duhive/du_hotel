import React, { useState, useEffect } from 'react';
import { X, Users, Eye, TrendingUp, Monitor, RefreshCw, Lock, ShieldCheck, Clock, Plus } from 'lucide-react';
import { getVisitorStats, resetVisitorStats, addDummyStats, VisitorStats } from '../utils/visitorTracker';

interface VisitorAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisitorAnalyticsModal: React.FC<VisitorAnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<VisitorStats>(getVisitorStats());
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');

  useEffect(() => {
    if (isOpen) {
      setStats(getVisitorStats());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    if (window.confirm('방문자 통계 데이터를 초기화하시겠습니까?')) {
      const updated = resetVisitorStats();
      setStats(updated);
    }
  };

  const handleAddSimulated = (count: number) => {
    const updated = addDummyStats(count);
    setStats(updated);
  };

  // Prepare last 7 days chart data
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = stats.dailyStats[dateStr] || (i === 0 ? stats.todayViews : 0);
      days.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        date: dateStr,
        count
      });
    }
    return days;
  };

  const last7Days = getLast7Days();
  const maxCount = Math.max(...last7Days.map(d => d.count), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 overflow-hidden">
        
        {/* Top Secret Badge Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-hive-green/10 text-hive-green rounded-2xl flex items-center justify-center font-bold border border-hive-green/20 shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">비밀 방문자 분석 시스템</h2>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  Admin Only
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold">
                  AI 스튜디오 접속 제외 필터링 적용됨
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">실시간 대구대 HIVE 홈페이지 방문자 통계 현황</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
            }`}
          >
            요약 대시보드
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'logs' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
            }`}
          >
            최근 방문 로그 ({stats.recentLogs?.length || 0}건)
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-800">오늘 방문자 수</span>
                  <Eye size={16} className="text-emerald-600" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-emerald-900 font-mono">
                  {stats.todayViews.toLocaleString()} <span className="text-xs font-sans font-medium text-emerald-700">회</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-800">순 방문자(UV)</span>
                  <Users size={16} className="text-blue-600" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-blue-900 font-mono">
                  {stats.totalUniqueVisitors.toLocaleString()} <span className="text-xs font-sans font-medium text-blue-700">명</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">총 누적 페이지뷰</span>
                  <TrendingUp size={16} className="text-slate-500" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-slate-900 font-mono">
                  {stats.totalViews.toLocaleString()} <span className="text-xs font-sans font-medium text-slate-500">회</span>
                </div>
              </div>
            </div>

            {/* 7-Day Chart Visualizer */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 mb-4 flex items-center justify-between">
                <span>최근 7일간 일별 방문 추이</span>
                <span className="text-[10px] font-normal text-slate-400">단위: 페이지뷰(PV)</span>
              </h4>
              <div className="flex items-end justify-between gap-2 h-32 pt-4 border-b border-slate-200/80 pb-2">
                {last7Days.map((day, idx) => {
                  const heightPercent = Math.round((day.count / maxCount) * 100);
                  const isToday = idx === 6;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <span className="text-[10px] font-mono font-bold text-slate-600 mb-1 opacity-80 group-hover:opacity-100">
                        {day.count}
                      </span>
                      <div 
                        style={{ height: `${Math.max(heightPercent, 8)}%` }}
                        className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                          isToday ? 'bg-hive-green shadow-sm' : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                      <span className={`text-[10px] font-mono mt-2 ${isToday ? 'text-hive-green font-bold' : 'text-slate-400'}`}>
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Admin Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">카운터 조정:</span>
                <button
                  onClick={() => handleAddSimulated(10)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus size={12} /> +10
                </button>
                <button
                  onClick={() => handleAddSimulated(50)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus size={12} /> +50
                </button>
              </div>

              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-rose-500 hover:bg-rose-50 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-rose-100"
              >
                <RefreshCw size={12} /> 카운터 초기화
              </button>
            </div>
          </div>
        ) : (
          /* Logs Tab */
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {stats.recentLogs && stats.recentLogs.length > 0 ? (
              stats.recentLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                      <Monitor size={14} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <span>경로: {log.path}</span>
                        <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px]">
                          {log.device}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        유입: {log.referrer}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-slate-400">
                    <div>{log.date}</div>
                    <div className="text-slate-600 font-semibold">{log.timestamp}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                기록된 최근 방문 로그가 없습니다.
              </div>
            )}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Lock size={11} /> 이 창은 푸터 하단의 Copyright(© 2026 HIVE...) 영역을 5회 연쇄 클릭할 때만 비밀스럽게 나타납니다.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
