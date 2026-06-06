import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Map, BarChart2, TrendingUp, Building2, Terminal } from 'lucide-react';
import LiveBadge from './shared/LiveBadge';
import { useStore } from '../store/useStore';

const NAV = [
  { to: '/map',        icon: Map,       label: 'Live Map'    },
  { to: '/planner',    icon: BarChart2,  label: 'Planner'     },
  { to: '/investor',   icon: TrendingUp, label: 'Investor'    },
  { to: '/government', icon: Building2,  label: 'Government'  },
  { to: '/simulator',  icon: Terminal,   label: 'Simulator'   },
];

const EXPANDED_W = 220;
const COLLAPSED_W = 56;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const activeDrivers    = useStore((s) => s.activeDrivers);
  const inferredVehicles = useStore((s) => s.inferredVehicles);
  const isConnected      = useStore((s) => s.isConnected);

  const w = collapsed ? COLLAPSED_W : EXPANDED_W;

  // Keep a CSS variable in sync so App.jsx main content can offset correctly
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', `${w}px`);
  }, [w]);

  return (
    <aside style={{
      width: w, minWidth: w, maxWidth: w,
      background: '#161B22',
      borderRight: '1px solid #30363D',
      display: 'flex', flexDirection: 'column',
      height: '100vh',
      position: 'fixed', left: 0, top: 0,
      transition: 'width 0.2s ease',
      zIndex: 100,
      overflow: 'hidden',
    }}>

      {/* Logo */}
      <Link to="/" style={{
        padding: '14px 0',
        paddingLeft: collapsed ? '0' : '16px',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: '10px',
        borderBottom: '1px solid #30363D',
        flexShrink: 0,
        textDecoration: 'none',
        cursor: 'pointer',
      }}>
        {/* Icon */}
        <div style={{
          width: 28, height: 28,
          background: '#1A6B3C',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          position: 'relative', overflow: 'hidden',
        }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ position: 'relative', zIndex: 1 }}>
            <path d="M2 10 C6 6, 14 6, 18 10 M2 10 C6 14, 14 14, 18 10" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="4" cy="8" r="1.5" fill="#F4A823" />
            <circle cx="10" cy="6" r="1.5" fill="#F4A823" />
            <circle cx="16" cy="8" r="1.5" fill="#F4A823" />
            <circle cx="6" cy="12" r="1.5" fill="white" />
            <circle cx="14" cy="12" r="1.5" fill="white" />
          </svg>
        </div>
        {!collapsed && (
          <span style={{ fontWeight: 700, fontSize: '13px', color: '#E6EDF3', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
            TRAXS
          </span>
        )}
      </Link>

      {/* Nav links */}
      <nav style={{ flex: 1, paddingTop: '6px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              padding: '11px 0',
              paddingLeft: collapsed ? '0' : '20px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: isActive ? '#E6EDF3' : '#8B949E',
              background: isActive ? 'rgba(26,107,60,0.1)' : 'transparent',
              borderLeft: isActive ? '2px solid #1A6B3C' : '2px solid transparent',
              textDecoration: 'none',
              fontSize: '13px',
              transition: 'color 0.15s, background 0.15s',
              whiteSpace: 'nowrap',
            })}
          >
            <Icon size={15} strokeWidth={1.5} style={{ flexShrink: 0 }} />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Live status */}
      <div style={{
        borderTop: '1px solid #30363D',
        padding: '14px 0',
        paddingLeft: collapsed ? '0' : '16px',
        display: 'flex', flexDirection: 'column',
        alignItems: collapsed ? 'center' : 'flex-start',
        gap: '5px',
        flexShrink: 0,
      }}>
        {isConnected
          ? <LiveBadge label={collapsed ? '' : 'LIVE'} />
          : <span style={{ color: '#8B949E', fontSize: '11px' }}>{collapsed ? '—' : 'OFFLINE'}</span>
        }
        {!collapsed && isConnected && (
          <div style={{ color: '#8B949E', fontSize: '11px', fontFamily: 'monospace', lineHeight: '1.6' }}>
            <div>{activeDrivers.length} drivers</div>
            <div>{inferredVehicles.length} vehicles</div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          borderTop: '1px solid #30363D',
          background: 'none',
          border: 'none',
          borderTop: '1px solid #30363D',
          color: '#8B949E',
          cursor: 'pointer',
          padding: '12px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end',
          paddingRight: collapsed ? '0' : '16px',
          fontSize: '12px',
          gap: '6px',
          transition: 'color 0.15s',
          flexShrink: 0,
          width: '100%',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#E6EDF3')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#8B949E')}
      >
        {/* Chevron arrow — points inward */}
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
        >
          <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {!collapsed && (
          <span style={{ fontSize: '11px', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>COLLAPSE</span>
        )}
      </button>
    </aside>
  );
}
