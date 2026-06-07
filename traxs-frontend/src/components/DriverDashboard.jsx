import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function SignalDots({ strength }) {
  return (
    <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: i <= strength ? '#2D9E5F' : '#30363D',
          transition: 'background 0.5s',
        }} />
      ))}
    </div>
  );
}

function FlashNumber({ value, format, unit, label }) {
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 380);
      return () => clearTimeout(t);
    }
  }, [value]);

  const displayed = format ? format(value) : value;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: '#8B949E', fontSize: '9px', letterSpacing: '0.08em', marginBottom: '5px' }}>{label}</div>
      <div style={{
        color: flash ? '#2D9E5F' : '#E6EDF3',
        fontFamily: 'monospace',
        fontSize: '20px',
        fontWeight: 700,
        transition: 'color 0.38s',
        lineHeight: 1,
      }}>
        {displayed}
      </div>
      {unit && <div style={{ color: '#8B949E', fontSize: '10px', marginTop: '3px' }}>{unit}</div>}
    </div>
  );
}

function TowerTriangulation({ signals, lastPing }) {
  const W = 300, H = 170;
  const towers = [
    { x: 75,  y: 38,  id: 'LAG_001', area: 'Oshodi' },
    { x: 225, y: 38,  id: 'LAG_002', area: 'Mushin'  },
    { x: 150, y: 148, id: 'LAG_003', area: 'Ikeja'   },
  ];
  const drv = { x: 150, y: 95 };

  return (
    <div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {towers.map((t, i) => (
            <path
              key={`tp-${i}`}
              id={`dash-tp-${i}`}
              d={`M ${t.x} ${t.y} L ${drv.x} ${drv.y}`}
            />
          ))}
        </defs>

        {/* Dashed signal lines + moving dots */}
        {towers.map((t, i) => (
          <g key={`link-${i}`}>
            <line
              x1={t.x} y1={t.y} x2={drv.x} y2={drv.y}
              stroke="#30363D" strokeWidth="1" strokeDasharray="4 4"
            />
            <circle r="3" fill="#2D9E5F" opacity="0.85">
              <animateMotion
                dur={`${1.3 + i * 0.4}s`}
                repeatCount="indefinite"
              >
                <mpath href={`#dash-tp-${i}`} />
              </animateMotion>
            </circle>
          </g>
        ))}

        {/* Tower icons */}
        {towers.map((t, i) => (
          <g key={`tw-${i}`} transform={`translate(${t.x}, ${t.y})`}>
            <line x1="0" y1="0" x2="0" y2="-22" stroke="#8B949E" strokeWidth="1.5" />
            <line x1="-7" y1="0" x2="0" y2="-8" stroke="#8B949E" strokeWidth="1" />
            <line x1="7"  y1="0" x2="0" y2="-8" stroke="#8B949E" strokeWidth="1" />
            <path d="M -5 -16 A 5 5 0 0 1 5 -16"   stroke="#2D9E5F" strokeWidth="1.2" fill="none" />
            <path d="M -9 -20 A 9 9 0 0 1 9 -20"   stroke="#2D9E5F" strokeWidth="1.2" fill="none" opacity="0.6" />
            <path d="M -13 -24 A 13 13 0 0 1 13 -24" stroke="#2D9E5F" strokeWidth="1"   fill="none" opacity="0.3" />
            <text y="14" textAnchor="middle" fill="#8B949E" fontSize="8"  fontFamily="monospace">{towers[i].id}</text>
            <text y="24" textAnchor="middle" fill="#8B949E" fontSize="7.5">{towers[i].area}</text>
          </g>
        ))}

        {/* Driver dot with pulse rings */}
        <circle cx={drv.x} cy={drv.y} r="9"  fill="none" stroke="#2D9E5F" strokeWidth="1.5">
          <animate attributeName="r"       values="9;26"   dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0"  dur="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx={drv.x} cy={drv.y} r="9"  fill="none" stroke="#2D9E5F" strokeWidth="1">
          <animate attributeName="r"       values="9;26"   dur="1.8s" begin="0.9s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0"  dur="1.8s" begin="0.9s" repeatCount="indefinite" />
        </circle>
        <circle cx={drv.x} cy={drv.y} r="9"  fill="#1A6B3C" stroke="#2D9E5F" strokeWidth="2" />
        <circle cx={drv.x} cy={drv.y} r="4.5" fill="#2D9E5F" />
      </svg>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '8px' }}>
        {[
          { label: 'LOCATION', value: '±85m', color: '#2D9E5F' },
          { label: 'LAST PING', value: `${lastPing}s ago`, color: '#E6EDF3' },
          { label: 'TOWERS',   value: '3 locked', color: '#2D9E5F' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ color: '#8B949E', fontSize: '9px', letterSpacing: '0.08em', marginBottom: '2px' }}>{label}</div>
            <div style={{ color, fontFamily: 'monospace', fontSize: '10px' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tower signal strength dots */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
        {towers.map((_, i) => <SignalDots key={i} strength={signals[i]} />)}
      </div>
    </div>
  );
}

function EventLog({ entries }) {
  return (
    <div style={{
      background: '#0D1117',
      border: '1px solid #30363D',
      borderRadius: '2px',
      padding: '10px 12px',
      fontFamily: 'monospace',
      fontSize: '10px',
      maxHeight: '130px',
      overflowY: 'auto',
    }}>
      {entries.length === 0 ? (
        <div style={{ color: '#30363D' }}>— awaiting events —</div>
      ) : (
        entries.slice(0, 8).map(e => (
          <div key={e.id} style={{ marginBottom: '3px', lineHeight: 1.5, animation: 'logFadeIn 0.3s ease' }}>
            <span style={{ color: '#2D9E5F' }}>[{e.time}]</span>{' '}
            <span style={{ color: '#E6EDF3' }}>{e.message}</span>
          </div>
        ))
      )}
    </div>
  );
}

function PlaceholderPanel() {
  return (
    <div style={{
      background: '#161B22',
      border: '1px solid #30363D',
      borderRadius: '4px',
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '420px',
      gap: '20px',
    }}>
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ opacity: 0.13 }}>
        <line x1="26" y1="52" x2="26" y2="20" stroke="#2D9E5F" strokeWidth="2.5" />
        <line x1="13" y1="52" x2="26" y2="32" stroke="#2D9E5F" strokeWidth="2" />
        <line x1="39" y1="52" x2="26" y2="32" stroke="#2D9E5F" strokeWidth="2" />
        <path d="M 15 26 A 11 11 0 0 1 37 26" stroke="#2D9E5F" strokeWidth="2"   fill="none" />
        <path d="M 9  20 A 17 17 0 0 1 43 20" stroke="#2D9E5F" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M 3  14 A 23 23 0 0 1 49 14" stroke="#2D9E5F" strokeWidth="1"   fill="none" opacity="0.3" />
      </svg>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#30363D', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.12em', margin: '0 0 8px' }}>
          NO ACTIVE SESSION
        </p>
        <p style={{ color: '#8B949E', fontSize: '12px', margin: 0, maxWidth: '230px', lineHeight: 1.6 }}>
          Dial *384*1# on the simulator and select a route to see live driver telemetry here.
        </p>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px',
        width: '100%', maxWidth: '260px', opacity: 0.25,
      }}>
        {['DISTANCE', 'SPEED', 'PASSENGERS', 'AIRTIME'].map(l => (
          <div key={l} style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: '2px', padding: '10px', textAlign: 'center' }}>
            <div style={{ color: '#8B949E', fontSize: '9px', letterSpacing: '0.08em', marginBottom: '4px' }}>{l}</div>
            <div style={{ color: '#30363D', fontFamily: 'monospace', fontSize: '18px', fontWeight: 700 }}>—</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DriverDashboard() {
  const activeSimDriver = useStore((s) => s.activeSimDriver);

  const [towerSignals, setTowerSignals] = useState([4, 3, 5]);
  const [lastPing, setLastPing] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTowerSignals([
        Math.min(5, Math.max(1, 3 + Math.round((Math.random() - 0.5) * 2))),
        Math.min(5, Math.max(1, 3 + Math.round((Math.random() - 0.5) * 3))),
        Math.min(5, Math.max(1, 4 + Math.round((Math.random() - 0.5) * 2))),
      ]);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setLastPing(0);
    const id = setInterval(() => setLastPing((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, [activeSimDriver?.currentWaypointIndex]);

  if (!activeSimDriver) return <PlaceholderPanel />;

  const {
    driverId, routeLabel, waypoints,
    currentWaypointIndex, distanceCovered,
    speed, passengers, airtime, progress, isActive, eventLog,
  } = activeSimDriver;

  const currWp   = waypoints[currentWaypointIndex];
  const nextWp   = waypoints[currentWaypointIndex + 1];
  const nextName = nextWp?.name || (currentWaypointIndex < waypoints.length - 1 ? `Stop ${currentWaypointIndex + 2}` : null);
  const distToNext = nextWp && currWp
    ? haversineKm(currWp.lat, currWp.lng, nextWp.lat, nextWp.lng)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: 0 }}>
        DRIVER TELEMETRY DASHBOARD
      </p>

      {/* 1 — Driver Identity Strip */}
      <div style={{
        background: '#0D1117', border: '1px solid #30363D', borderRadius: '2px',
        padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: isActive ? '#2D9E5F' : '#8B949E',
              animation: isActive ? 'idPulse 2s ease-in-out infinite' : 'none',
              flexShrink: 0,
            }} />
            <span style={{ color: '#2D9E5F', fontFamily: 'monospace', fontSize: '12px', fontWeight: 700 }}>
              {driverId || 'DRV-UNKNOWN'}
            </span>
          </div>
          <div style={{ color: '#8B949E', fontSize: '11px', fontFamily: 'monospace' }}>
            Danfo · {routeLabel}
          </div>
        </div>
        <div style={{
          border: `1px solid ${isActive ? '#1A6B3C' : '#30363D'}`,
          color: isActive ? '#2D9E5F' : '#8B949E',
          fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.08em',
          padding: '3px 8px', borderRadius: '2px',
        }}>
          {isActive ? '● LIVE' : '✓ DONE'}
        </div>
      </div>

      {/* 2 — Cell Tower Triangulation */}
      <div style={{
        background: '#0D1117', border: '1px solid #30363D', borderRadius: '2px', padding: '12px 14px',
      }}>
        <p style={{ color: '#8B949E', fontSize: '10px', letterSpacing: '0.08em', margin: '0 0 8px' }}>
          CELL TOWER TRIANGULATION
        </p>
        <TowerTriangulation signals={towerSignals} lastPing={lastPing} />
      </div>

      {/* 3 — Live Journey Stats */}
      <div style={{
        background: '#0D1117', border: '1px solid #30363D', borderRadius: '2px', padding: '12px 14px',
      }}>
        <p style={{ color: '#8B949E', fontSize: '10px', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          LIVE JOURNEY STATS
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          <FlashNumber value={parseFloat(distanceCovered.toFixed(2))} format={(v) => v.toFixed(1)} unit="km"  label="DISTANCE"   />
          <FlashNumber value={speed}                                                                 unit="km/h" label="SPEED"      />
          <FlashNumber value={passengers}                                                            unit="pax"  label="PASSENGERS" />
          <FlashNumber value={airtime}                    format={(v) => `₦${v}`}                   label="AIRTIME"    />
        </div>
      </div>

      {/* 4 — Route Progress Bar */}
      <div style={{
        background: '#0D1117', border: '1px solid #30363D', borderRadius: '2px', padding: '12px 14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ color: '#8B949E', fontSize: '10px', letterSpacing: '0.08em' }}>ROUTE PROGRESS</span>
          <span style={{ color: '#2D9E5F', fontFamily: 'monospace', fontSize: '11px', fontWeight: 700 }}>{progress}%</span>
        </div>
        <div style={{ background: '#30363D', borderRadius: '2px', height: '6px', overflow: 'hidden', marginBottom: '8px' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, #1A6B3C, #2D9E5F)',
            borderRadius: '2px', transition: 'width 0.7s ease',
          }} />
        </div>
        <div style={{ color: '#8B949E', fontSize: '10px', fontFamily: 'monospace' }}>
          {progress < 100 && nextName
            ? `NEXT: ${nextName}${distToNext > 0 ? ` — ${distToNext.toFixed(1)}km` : ''}`
            : 'DESTINATION REACHED'
          }
        </div>
      </div>

      {/* 5 — Network Event Log */}
      <div>
        <p style={{ color: '#8B949E', fontSize: '10px', letterSpacing: '0.08em', margin: '0 0 6px' }}>
          NETWORK EVENT LOG
        </p>
        <EventLog entries={eventLog || []} />
      </div>

      <style>{`
        @keyframes idPulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(45,158,95,0.3); }
          50%       { box-shadow: 0 0 0 5px rgba(45,158,95,0); }
        }
        @keyframes logFadeIn {
          from { opacity: 0; transform: translateX(-4px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
