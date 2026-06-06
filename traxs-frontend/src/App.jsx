import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSocket } from './hooks/useSocket';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import LiveMap from './pages/LiveMap';
import Planner from './pages/Planner';
import Investor from './pages/Investor';
import Government from './pages/Government';
import Simulator from './pages/Simulator';

function AppInner() {
  useSocket();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/*" element={
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0D1117' }}>
          <Sidebar />
          <main style={{ marginLeft: 'var(--sidebar-w, 220px)', flex: 1, overflow: 'auto', height: '100vh', transition: 'margin-left 0.2s ease' }}>
            <Routes>
              <Route path="/map" element={<LiveMap />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/investor" element={<Investor />} />
              <Route path="/government" element={<Government />} />
              <Route path="/simulator" element={<Simulator />} />
            </Routes>
          </main>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AppInner />
    </BrowserRouter>
  );
}
