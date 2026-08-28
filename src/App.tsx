import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Greetings from './pages/Greetings';
import Network from './pages/Network';
import Activities from './pages/Activities';
import Columns from './pages/Columns';
import Projects from './pages/Projects';
import Photo from './pages/Photo';
import Notices from './pages/Notices';
import Organization from './pages/Organization';
import Members from './pages/Members';
import Join from './pages/Join';
import Contact from './pages/Contact';
import { AuthProvider, AuthModal } from './components/Auth';
import ErrorBoundary from './components/ErrorBoundary';
import { recordPageView } from './utils/visitorTracker';
import { ApplicationAdminModal } from './components/ApplicationAdminModal';
import { useState } from 'react';

function ScrollToTopAndTrack() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    recordPageView(pathname);
  }, [pathname]);
  return null;
}

export default function App() {
  const [isAppAdminOpen, setIsAppAdminOpen] = useState(false);

  // Global keypress listener for typing '2405' anywhere
  useEffect(() => {
    let keyBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing inside an input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (/\d/.test(e.key)) {
        keyBuffer += e.key;
        if (keyBuffer.length > 10) {
          keyBuffer = keyBuffer.slice(-10);
        }
        if (keyBuffer.endsWith('2405')) {
          setIsAppAdminOpen(true);
          keyBuffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ScrollToTopAndTrack />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/greetings" element={<Greetings />} />
                <Route path="/network" element={<Network />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/columns" element={<Columns />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/photo" element={<Photo />} />
                <Route path="/notices" element={<Notices />} />
                <Route path="/members" element={<Members />} />
                <Route path="/organization" element={<Organization />} />
                <Route path="/join" element={<Join />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>
            <Footer />
            <AuthModal />
            <ApplicationAdminModal 
              isOpen={isAppAdminOpen} 
              onClose={() => setIsAppAdminOpen(false)} 
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
