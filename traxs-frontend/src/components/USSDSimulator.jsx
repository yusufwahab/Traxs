import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

const API = import.meta.env.VITE_API_BASE_URL;

const ROUTES = [
  { label: 'Oshodi-Ikeja',  origin: 'Oshodi',  lat: 6.5568, lng: 3.3486 },
  { label: 'Ikeja-CMS',     origin: 'Ikeja',   lat: 6.6018, lng: 3.3515 },
  { label: 'CMS-Lekki',     origin: 'CMS',     lat: 6.4541, lng: 3.3947 },
  { label: 'Lekki-Ajah',    origin: 'Lekki',   lat: 6.4698, lng: 3.5852 },
  { label: 'Ikorodu-Owutu', origin: 'Ikorodu', lat: 6.6194, lng: 3.5060 },
];

const EVENTS = [
  { label: 'Road Blocked',  value: 'road_blocked'      },
  { label: 'Police Check',  value: 'police_checkpoint' },
  { label: 'Accident',      value: 'accident'          },
  { label: 'Flooding',      value: 'flooding'          },
  { label: 'Long Queue',    value: 'long_queue'        },
];

const ROUTE_WAYPOINTS = {
  'Oshodi-Ikeja': [
    { lat: 6.5568, lng: 3.3486 }, { lat: 6.5612, lng: 3.3498 },
    { lat: 6.5680, lng: 3.3510 }, { lat: 6.5720, lng: 3.3515 },
    { lat: 6.5780, lng: 3.3520 }, { lat: 6.6018, lng: 3.3515 },
  ],
  'Ikeja-CMS': [
    { lat: 6.6018, lng: 3.3515 }, { lat: 6.5800, lng: 3.3600 },
    { lat: 6.5500, lng: 3.3700 }, { lat: 6.5200, lng: 3.3800 },
    { lat: 6.4900, lng: 3.3900 }, { lat: 6.4541, lng: 3.3947 },
  ],
  'CMS-Lekki': [
    { lat: 6.4541, lng: 3.3947 }, { lat: 6.4550, lng: 3.4200 },
    { lat: 6.4600, lng: 3.4600 }, { lat: 6.4650, lng: 3.5000 },
    { lat: 6.4698, lng: 3.5852 },
  ],
  'Lekki-Ajah': [
    { lat: 6.4698, lng: 3.5852 }, { lat: 6.4680, lng: 3.6100 },
    { lat: 6.4670, lng: 3.6400 }, { lat: 6.4660, lng: 3.6700 },
    { lat: 6.4650, lng: 3.7000 },
  ],
  'Ikorodu-Owutu': [
    { lat: 6.6194, lng: 3.5060 }, { lat: 6.6100, lng: 3.5100 },
    { lat: 6.6000, lng: 3.5150 }, { lat: 6.5900, lng: 3.5200 },
    { lat: 6.5800, lng: 3.5250 },
  ],
};

const EN_ROUTE_MSGS = (routeLabel) => [
  `En route...\n================\n${routeLabel}\nSpeed: 34 km/h\nPassengers: ~12\n\nTRAXS tracking\nyour journey.`,
  `Checkpoint passed\n================\n2.3km covered\nETA: 14 mins\n\nNetwork signal: ●●●○`,
  `Almost there...\n================\n4.1km covered\nNext stop: done\n\nAirtime balance:\n₦350 total`,
];

const TEXTS = {
  IDLE:         'Ready to dial\n\nEnter *384*1#\nthen press CALL',
  CONNECTED:    'TRAXS Mobility\n================\n1. Start Trip\n2. Report Issue\n3. My Earnings\n4. End Trip\n\nReply:',
  ROUTE_SELECT: 'Select Route:\n================\n1. Oshodi-Ikeja\n2. Ikeja-CMS\n3. CMS-Lekki\n4. Lekki-Ajah\n5. Ikorodu-Owutu\n\nReply:',
  REPORT_TYPE:  'Report Issue:\n================\n1. Road Blocked\n2. Police Check\n3. Accident\n4. Flooding\n5. Long Queue\n\nReply:',
  EARNINGS:     'Your Earnings:\n================\nTrips Today: 7\nEarnings: ₦14,000\nAirtime: ₦350\n\nKeep going!\n\n[END to exit]',
  INVALID:      'Invalid input.\nPlease try again.\n\n[BACK to return]',
  ENDED:        'Session Ended.\n\nDial *384*1#\nto start again.',
  LOADING:      'Connecting...\n\nPlease wait...',
};

// ── PhoneScreen: typing animation, remounts via key prop ──────────────────────
function PhoneScreen({ text, dialBuffer, isDialing }) {
  const [shown, setShown] = useState('');

  useEffect(() => {
    if (isDialing) return;
    setShown('');
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [text, isDialing]);

  return (
    <div style={{
      margin: '0 10px',
      background: '#040f07',
      borderRadius: '4px',
      border: '1px solid #1c3d28',
      padding: '7px 8px',
      height: '140px',
      fontFamily: '"Courier New", "Lucida Console", monospace',
      fontSize: '9.5px',
      lineHeight: '1.55',
      overflow: 'hidden',
      whiteSpace: 'pre-wrap',
      color: '#2D9E5F',
      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', opacity: 0.35, fontSize: '7.5px' }}>
        <span>TRAXS</span><span>● ● ●</span>
      </div>
      {isDialing
        ? <span>{dialBuffer}<span style={{ animation: 'ussdCaret 1s step-end infinite' }}>_</span></span>
        : <span>{shown}</span>
      }
    </div>
  );
}

// ── PhoneKey ──────────────────────────────────────────────────────────────────
function PhoneKey({ label, onClick, color = '#232323', textColor = '#cccccc', disabled = false }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: pressed
          ? (color === '#232323' ? '#1a6b3c' : color === '#1A6B3C' ? '#2D9E5F' : '#9B0000')
          : color,
        color: textColor,
        border: `1px solid ${color === '#232323' ? '#3a3a3a' : color}`,
        borderBottom: pressed ? '1px solid #111' : '3px solid #111',
        borderRadius: '5px',
        padding: pressed ? '8px 0 6px' : '7px 0',
        fontSize: '10px',
        fontFamily: 'monospace',
        fontWeight: '700',
        cursor: disabled ? 'default' : 'pointer',
        textAlign: 'center',
        letterSpacing: '0.04em',
        opacity: disabled ? 0.3 : 1,
        transition: 'background 0.08s',
        userSelect: 'none',
      }}
    >
      {label}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function USSDSimulator() {
  const navigate = useNavigate();
  const location = useLocation();

  const startDriverSimulation = useStore((s) => s.startDriverSimulation);
  const stopDriverSimulation  = useStore((s) => s.stopDriverSimulation);
  const setMapFlyTarget       = useStore((s) => s.setMapFlyTarget);
  const simulatedDriver       = useStore((s) => s.simulatedDriver);

  const [phase, setPhase]           = useState('IDLE');
  const [dialBuffer, setDialBuffer] = useState('');
  const [screenText, setScreenText] = useState(TEXTS.IDLE);
  const [driverId, setDriverId]     = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const prevPhase  = useRef('IDLE');
  const busy       = useRef(false);
  const navTimerRef = useRef(null);

  // ── Transient state timers ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'ENDED') {
      const t = setTimeout(() => {
        setPhase('IDLE'); setDialBuffer(''); setScreenText(TEXTS.IDLE);
        setDriverId(null); setSelectedRoute(null); busy.current = false;
      }, 2500);
      return () => clearTimeout(t);
    }
    if (phase === 'INVALID') {
      const t = setTimeout(() => {
        const p = prevPhase.current;
        setPhase(p); setScreenText(TEXTS[p] || '');
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // ── Phone status cycling while driver is moving ────────────────────────────
  useEffect(() => {
    if (phase !== 'TRIP_STARTED' || !selectedRoute) return;
    const msgs = EN_ROUTE_MSGS(selectedRoute.label);
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % msgs.length;
      setScreenText(msgs[i]);
    }, 4000);
    return () => clearInterval(id);
  }, [phase, selectedRoute]);

  // ── Detect trip complete from Zustand ──────────────────────────────────────
  useEffect(() => {
    if (simulatedDriver?.status === 'complete' && phase === 'TRIP_STARTED') {
      const routeLabel = selectedRoute?.label || simulatedDriver.routeLabel || '';
      setPhase('TRIP_COMPLETE');
      setScreenText(
        `Trip Complete!\n================\nRoute: ${routeLabel}\nDistance: 5.8km\nDuration: 18 mins\nPassengers: ~12\n\nEarnings: ₦2,000\nAirtime: ₦50 ✓\n\nStart new trip?\n1. Yes  2. Exit`
      );
    }
  }, [simulatedDriver?.status]); // eslint-disable-line

  // ── Cleanup nav timer on unmount ───────────────────────────────────────────
  useEffect(() => () => { if (navTimerRef.current) clearTimeout(navTimerRef.current); }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function go(newPhase, customText) {
    prevPhase.current = phase;
    setPhase(newPhase);
    setScreenText(customText !== undefined ? customText : (TEXTS[newPhase] || ''));
  }
  function invalid() {
    prevPhase.current = phase;
    setPhase('INVALID');
    setScreenText(TEXTS.INVALID);
  }

  // ── Key handlers ───────────────────────────────────────────────────────────
  const handleCall = () => {
    if (busy.current) return;
    if (phase !== 'IDLE' && phase !== 'DIALING') return;
    if (dialBuffer === '*384*1#') {
      setDialBuffer(''); go('CONNECTED');
    } else if (dialBuffer) {
      go('INVALID', 'Invalid number.\nTry *384*1#\n\n[BACK]');
    }
  };

  const handleEnd = () => {
    if (phase === 'IDLE' || phase === 'ENDED') return;
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    stopDriverSimulation();
    if (driverId) {
      fetch(`${API}/api/drivers/end-session`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId }),
      }).catch(() => {});
    }
    go('ENDED');
  };

  const handleDelete = () => {
    if (phase !== 'DIALING') return;
    const next = dialBuffer.slice(0, -1);
    setDialBuffer(next);
    if (!next) { setPhase('IDLE'); setScreenText(TEXTS.IDLE); }
  };

  const handleKey = async (key) => {
    if (busy.current) return;

    // Dial buffer
    if (phase === 'IDLE' || phase === 'DIALING') {
      setDialBuffer(prev => prev + key);
      setPhase('DIALING');
      return;
    }

    // Main menu
    if (phase === 'CONNECTED') {
      if (key === '1') { go('ROUTE_SELECT'); return; }
      if (key === '2') { go('REPORT_TYPE');  return; }
      if (key === '3') { go('EARNINGS');     return; }
      if (key === '4') {
        busy.current = true;
        go('LOADING');
        if (driverId) {
          try {
            await fetch(`${API}/api/drivers/end-session`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ driverId }),
            });
          } catch {}
        }
        go('END_TRIP', 'Trip Ended\n================\nSummary:\nTrips: 7\nEarned: ₦14,000\nAirtime: +₦50\n\nGoodbye!');
        busy.current = false;
        return;
      }
      invalid(); return;
    }

    // Route selection → fires real API + starts map simulation
    if (phase === 'ROUTE_SELECT') {
      const idx = parseInt(key, 10) - 1;
      if (idx >= 0 && idx < ROUTES.length) {
        const route = ROUTES[idx];
        setSelectedRoute(route);
        busy.current = true;
        go('LOADING');

        let newDriverId = null;
        try {
          const phone = `080${Math.floor(Math.random() * 1e8).toString().padStart(8, '0')}`;
          const res = await fetch(`${API}/api/drivers/activate`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone, deviceType: 'feature_phone', vehicleType: 'danfo', homePark: route.origin }),
          });
          const json = await res.json();
          if (json.success) newDriverId = json.data.driverId;
        } catch {}

        if (newDriverId) setDriverId(newDriverId);

        // Start movement simulation in Zustand (survives navigation)
        const waypoints = ROUTE_WAYPOINTS[route.label] || [{ lat: route.lat, lng: route.lng }];
        startDriverSimulation(newDriverId || `SIM-${Date.now()}`, route.label, waypoints);

        // Pan the map to starting position
        setMapFlyTarget({ lat: waypoints[0].lat, lng: waypoints[0].lng, zoom: 14 });

        // Trip confirmation on phone
        go('TRIP_STARTED',
          `Trip Started!\n================\nRoute: ${route.label}\nVehicle: Danfo\nAirtime: +₦50 credited\n\nJoining network...`
        );
        busy.current = false;

        // Navigate to Live Network map after 2 seconds if not already there
        navTimerRef.current = setTimeout(() => {
          if (location.pathname !== '/map') navigate('/map');
        }, 2000);
        return;
      }
      invalid(); return;
    }

    // Report event type
    if (phase === 'REPORT_TYPE') {
      const idx = parseInt(key, 10) - 1;
      if (idx >= 0 && idx < EVENTS.length) {
        const evt = EVENTS[idx];
        busy.current = true;
        go('LOADING');
        const lat = (selectedRoute?.lat ?? 6.5244) + (Math.random() - 0.5) * 0.05;
        const lng = (selectedRoute?.lng ?? 3.3792) + (Math.random() - 0.5) * 0.05;
        try {
          await fetch(`${API}/api/drivers/report`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              driverId: driverId || 'DRV-SEED-001',
              eventType: evt.value, lat, lng,
              description: `${evt.label} reported via USSD simulator`,
            }),
          });
        } catch {}
        go('REPORT_DONE', `Report Submitted\n================\nType: ${evt.label}\nStatus: Live on map\n\nThank you!\n\n[END to exit]`);
        busy.current = false;
        return;
      }
      invalid(); return;
    }

    // Trip complete — 1 = new trip, 2 = exit
    if (phase === 'TRIP_COMPLETE') {
      if (key === '1') {
        stopDriverSimulation();
        setDriverId(null);
        go('ROUTE_SELECT');
        return;
      }
      if (key === '2') {
        stopDriverSimulation();
        go('ENDED');
        return;
      }
      invalid(); return;
    }
  };

  const isDialing = phase === 'IDLE' || phase === 'DIALING';
  const canInput  = ['IDLE','DIALING','CONNECTED','ROUTE_SELECT','REPORT_TYPE','TRIP_COMPLETE'].includes(phase);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Label */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ color: '#2D9E5F', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 5px' }}>
          LIVE USSD SIMULATOR
        </p>
        <p style={{ color: '#8B949E', fontSize: '12px', margin: 0 }}>
          Dial *384*1# and press CALL to start a real driver session
        </p>
      </div>

      {/* Phone shell */}
      <div style={{
        width: '200px',
        background: 'linear-gradient(180deg, #1e1e1e 0%, #161616 100%)',
        borderRadius: '28px',
        border: '3px solid #2d2d2d',
        boxShadow: '0 24px 64px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04)',
        paddingBottom: '16px',
        userSelect: 'none',
        position: 'relative',
      }}>

        {/* Side volume nubs */}
        <div style={{ position: 'absolute', left: '-6px', top: '60px', width: '4px', height: '22px', background: '#2d2d2d', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: '-6px', top: '88px', width: '4px', height: '22px', background: '#2d2d2d', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', right: '-6px', top: '74px', width: '4px', height: '30px', background: '#2d2d2d', borderRadius: '0 2px 2px 0' }} />

        {/* Speaker + camera row */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px 0 8px' }}>
          <div style={{ width: '6px', height: '6px', background: '#1e2e24', borderRadius: '50%', border: '1px solid #2a2a2a' }} />
          <div style={{ width: '36px', height: '3px', background: '#2d2d2d', borderRadius: '2px' }} />
          <div style={{ width: '6px', height: '6px', background: '#1e2e24', borderRadius: '50%', border: '1px solid #2a2a2a' }} />
        </div>

        {/* Screen bezel */}
        <div style={{ margin: '0 10px 8px', background: '#0d0d0d', borderRadius: '6px', padding: '4px', border: '1px solid #1a1a1a' }}>
          <PhoneScreen key={phase} text={screenText} dialBuffer={dialBuffer} isDialing={isDialing} />
        </div>

        {/* CALL / DEL / END row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', padding: '0 10px 4px' }}>
          <PhoneKey label="CALL" onClick={handleCall} color="#1A6B3C" textColor="#ffffff" />
          <PhoneKey label="DEL"  onClick={handleDelete} />
          <PhoneKey label="END"  onClick={handleEnd} color="#6B0000" textColor="#ffaaaa" />
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#222', margin: '2px 16px 6px' }} />

        {/* Number keypad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', padding: '0 10px' }}>
          {['1','2','3','4','5','6','7','8','9','*','0','#'].map(key => (
            <PhoneKey key={key} label={key} onClick={() => handleKey(key)} disabled={!canInput} />
          ))}
        </div>

        {/* Home button */}
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: '#1e1e1e', border: '2px solid #2d2d2d',
          margin: '12px auto 0',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
        }} />
      </div>

      {/* Key hint row */}
      <div style={{ marginTop: '14px', display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        {['*','3','8','4','*','1','#'].map((k, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '22px', height: '22px',
            background: '#161B22', border: '1px solid #30363D',
            borderRadius: '3px', color: '#8B949E', fontFamily: 'monospace', fontSize: '11px',
          }}>{k}</span>
        ))}
        <span style={{ color: '#8B949E', fontSize: '11px' }}>→ CALL</span>
      </div>

      <style>{`
        @keyframes ussdCaret { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
