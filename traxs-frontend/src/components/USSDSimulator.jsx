import { useState, useEffect, useRef } from 'react';

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

// Typing animation sub-component — remounted via key prop when phase changes
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
      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6), 0 0 12px rgba(45,158,95,0.04)',
      position: 'relative',
    }}>
      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', opacity: 0.35, fontSize: '7.5px' }}>
        <span>TRAXS</span>
        <span>● ● ●</span>
      </div>
      {isDialing ? (
        <span>
          {dialBuffer}
          <span style={{ animation: 'ussdCaret 1s step-end infinite' }}>_</span>
        </span>
      ) : (
        <span>{shown}</span>
      )}
    </div>
  );
}

function PhoneKey({ label, onClick, color = '#232323', textColor = '#cccccc', disabled = false }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: pressed ? (color === '#232323' ? '#1a6b3c' : color === '#1A6B3C' ? '#2D9E5F' : '#9B0000') : color,
        color: textColor,
        border: `1px solid ${color === '#232323' ? '#3a3a3a' : color}`,
        borderBottom: pressed ? `1px solid #111` : `3px solid #111`,
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

export default function USSDSimulator() {
  const [phase, setPhase] = useState('IDLE');
  const [dialBuffer, setDialBuffer] = useState('');
  const [screenText, setScreenText] = useState(TEXTS.IDLE);
  const [driverId, setDriverId] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const prevPhase = useRef('IDLE');
  const busy = useRef(false);

  // Transient state auto-reset
  useEffect(() => {
    if (phase === 'ENDED') {
      const t = setTimeout(() => {
        setPhase('IDLE');
        setDialBuffer('');
        setScreenText(TEXTS.IDLE);
        setDriverId(null);
        setSelectedRoute(null);
        busy.current = false;
      }, 2500);
      return () => clearTimeout(t);
    }
    if (phase === 'INVALID') {
      const t = setTimeout(() => {
        const p = prevPhase.current;
        setPhase(p);
        setScreenText(TEXTS[p] || '');
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

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

  const handleCall = () => {
    if (busy.current) return;
    if (phase !== 'IDLE' && phase !== 'DIALING') return;
    if (dialBuffer === '*384*1#') {
      setDialBuffer('');
      go('CONNECTED');
    } else if (dialBuffer) {
      go('INVALID', 'Invalid number.\nTry *384*1#\n\n[BACK]');
    }
  };

  const handleEnd = () => {
    if (phase === 'IDLE' || phase === 'ENDED') return;
    if (driverId) {
      fetch(`${API}/api/drivers/end-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId }),
      }).catch(() => {});
    }
    go('ENDED');
  };

  const handleDelete = () => {
    if (phase !== 'DIALING') return;
    const next = dialBuffer.slice(0, -1);
    setDialBuffer(next);
    if (!next) {
      setPhase('IDLE');
      setScreenText(TEXTS.IDLE);
    }
  };

  const handleKey = async (key) => {
    if (busy.current) return;

    // Append to dial buffer
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

    // Route selection
    if (phase === 'ROUTE_SELECT') {
      const idx = parseInt(key, 10) - 1;
      if (idx >= 0 && idx < ROUTES.length) {
        const route = ROUTES[idx];
        setSelectedRoute(route);
        busy.current = true;
        go('LOADING');
        try {
          const phone = `080${Math.floor(Math.random() * 1e8).toString().padStart(8, '0')}`;
          const res = await fetch(`${API}/api/drivers/activate`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone, deviceType: 'feature_phone', vehicleType: 'danfo', homePark: route.origin }),
          });
          const json = await res.json();
          if (json.success) setDriverId(json.data.driverId);
        } catch {}
        go('TRIP_STARTED', `Trip Started!\n================\nRoute: ${route.label}\nAirtime: +₦50\n\nSafe travels!\nDriver ID saved.\n\n[END to exit]`);
        busy.current = false;
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
  };

  const isDialing = phase === 'IDLE' || phase === 'DIALING';
  const canInput  = ['IDLE','DIALING','CONNECTED','ROUTE_SELECT','REPORT_TYPE'].includes(phase);

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
        boxShadow: '0 24px 64px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4)',
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
          <PhoneScreen
            key={phase}
            text={screenText}
            dialBuffer={dialBuffer}
            isDialing={isDialing}
          />
        </div>

        {/* D-pad / nav row */}
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
            <PhoneKey
              key={key}
              label={key}
              onClick={() => handleKey(key)}
              disabled={!canInput}
            />
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

      {/* Hint row */}
      <div style={{ marginTop: '14px', display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['*', '3', '8', '4', '*', '1', '#'].map((k, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '22px', height: '22px',
            background: '#161B22', border: '1px solid #30363D',
            borderRadius: '3px', color: '#8B949E', fontFamily: 'monospace', fontSize: '11px',
          }}>{k}</span>
        ))}
        <span style={{ color: '#8B949E', fontSize: '11px', alignSelf: 'center' }}>then CALL</span>
      </div>

      <style>{`
        @keyframes ussdCaret {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
