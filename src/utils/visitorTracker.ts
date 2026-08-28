export interface VisitLog {
  id: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  path: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  referrer: string;
}

export interface VisitorStats {
  totalViews: number;
  totalUniqueVisitors: number;
  todayViews: number;
  lastDate: string; // YYYY-MM-DD
  dailyStats: Record<string, number>; // YYYY-MM-DD -> count
  visitorIds: string[]; // unique user IDs
  recentLogs: VisitLog[];
}

const STORAGE_KEY = 'hive_visitor_analytics_v1';
const VISITOR_ID_KEY = 'hive_visitor_client_id';
const SESSION_KEY = 'hive_session_active';

export function getVisitorStats(): VisitorStats {
  const saved = localStorage.getItem(STORAGE_KEY);
  const today = new Date().toISOString().split('T')[0];

  let stats: VisitorStats = {
    totalViews: 0,
    totalUniqueVisitors: 0,
    todayViews: 0,
    lastDate: today,
    dailyStats: {},
    visitorIds: [],
    recentLogs: []
  };

  if (saved) {
    try {
      stats = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse visitor stats", e);
    }
  }

  // If date changed, reset todayViews
  if (stats.lastDate !== today) {
    stats.lastDate = today;
    stats.todayViews = stats.dailyStats[today] || 0;
  }

  return stats;
}

export function isAIStudioOrDevEnv(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname || '';
  const referrer = document.referrer || '';
  const isIframe = window.self !== window.top;
  
  // AI Studio Dev app domain (ais-dev-*), localhost, or embedded preview iframe
  const isAISDevDomain = hostname.includes('ais-dev-');
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isAIStudioReferrer = referrer.includes('ai.studio') || referrer.includes('google.com') || referrer.includes('antigravity');

  return isAISDevDomain || isLocalhost || isIframe || isAIStudioReferrer;
}

export function recordPageView(path: string = window.location.pathname): VisitorStats {
  const stats = getVisitorStats();

  // Exclude AI Studio preview / dev environment visits
  if (isAIStudioOrDevEnv()) {
    console.log('[VisitorTracker] Excluded AI Studio / Dev environment pageview');
    return stats;
  }

  const today = new Date().toISOString().split('T')[0];

  // Get or create unique visitor ID
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = 'user_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  // Detect device
  const ua = navigator.userAgent;
  let device: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/ipad|tablet/i.test(ua)) device = 'Tablet';

  // Increment view counts
  stats.totalViews = (stats.totalViews || 0) + 1;
  stats.todayViews = (stats.todayViews || 0) + 1;
  stats.dailyStats[today] = (stats.dailyStats[today] || 0) + 1;

  if (!stats.visitorIds.includes(visitorId)) {
    stats.visitorIds.push(visitorId);
    stats.totalUniqueVisitors = stats.visitorIds.length;
  }

  // Log entry
  const newLog: VisitLog = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: today,
    path: path || '/',
    device,
    referrer: document.referrer ? new URL(document.referrer).hostname : '직접 접속'
  };

  stats.recentLogs = [newLog, ...(stats.recentLogs || [])].slice(0, 30); // keep last 30 logs

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  return stats;
}

export function resetVisitorStats(): VisitorStats {
  const today = new Date().toISOString().split('T')[0];
  const newStats: VisitorStats = {
    totalViews: 1,
    totalUniqueVisitors: 1,
    todayViews: 1,
    lastDate: today,
    dailyStats: { [today]: 1 },
    visitorIds: ['admin'],
    recentLogs: []
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
  return newStats;
}

export function addDummyStats(count: number = 50): VisitorStats {
  const stats = getVisitorStats();
  const today = new Date().toISOString().split('T')[0];
  
  stats.totalViews += count;
  stats.todayViews += count;
  stats.dailyStats[today] = (stats.dailyStats[today] || 0) + count;
  
  for (let i = 0; i < count; i++) {
    const randomId = 'sim_' + Math.random().toString(36).substring(2, 8);
    if (!stats.visitorIds.includes(randomId)) {
      stats.visitorIds.push(randomId);
    }
  }
  stats.totalUniqueVisitors = stats.visitorIds.length;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  return stats;
}
