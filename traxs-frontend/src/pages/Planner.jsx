import MetricCard from '../components/shared/MetricCard';
import InsightCallout from '../components/shared/InsightCallout';
import { MOCK_CORRIDORS, MOCK_HOURLY_MOVEMENTS, MOCK_ROUTE_EVENTS } from '../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';

const TOOLTIP_STYLE = { background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3', fontSize: '12px' };

const ghostCorridors = MOCK_CORRIDORS.filter((c) => c.ghostCorridor);
const topCorridors   = [...MOCK_CORRIDORS].sort((a, b) => b.dailyMovements - a.dailyMovements);

const METRICS = {
  totalMovements: MOCK_CORRIDORS.reduce((s, c) => s + c.dailyMovements, 0),
  ghostCount: ghostCorridors.length,
  hotspots: 11,
  coverageGapScore: 72,
};

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function Planner() {
  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#E6EDF3', margin: 0 }}>
          Urban Planner Intelligence
        </h1>
        <p style={{ color: '#8B949E', fontSize: '13px', margin: '4px 0 0' }}>
          Lagos Mobility Network — Live View
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <MetricCard label="Passenger Movements Today"  value={METRICS.totalMovements.toLocaleString()} />
        <MetricCard label="Active Ghost Corridors"     value={METRICS.ghostCount}        color="#F4A823" />
        <MetricCard label="Congestion Hotspots"        value={METRICS.hotspots}          color="#DA3633" />
        <MetricCard
          label="Coverage Gap Score"
          value={METRICS.coverageGapScore}
          color="#DA3633"
          subtitle="0 = full coverage, 100 = critical gap"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Ghost Corridors */}
          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px' }}>
            <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 16px' }}>
              GHOST CORRIDORS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ghostCorridors.map((c) => (
                <div key={c.id} style={{
                  background: '#0D1117', border: '1px solid #30363D', borderRadius: '4px',
                  padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <p style={{ color: '#E6EDF3', fontSize: '13px', margin: '0 0 4px' }}>{c.name}</p>
                    <p style={{ color: '#8B949E', fontSize: '11px', fontFamily: 'monospace', margin: 0 }}>
                      {c.dailyMovements.toLocaleString()} daily · Supply {c.supplyScore} · Demand {c.demandScore}
                    </p>
                  </div>
                  {c.demandScore > 70 && (
                    <span style={{
                      color: '#DA3633', border: '1px solid #DA3633', fontSize: '10px',
                      letterSpacing: '0.08em', padding: '2px 6px', borderRadius: '2px', fontFamily: 'monospace',
                    }}>
                      HIGH PRIORITY
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Route Events */}
          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px' }}>
            <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 16px' }}>
              ACTIVE ROUTE EVENTS
            </p>
            {MOCK_ROUTE_EVENTS.map((e, i) => (
              <div key={e.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: i < MOCK_ROUTE_EVENTS.length - 1 ? '1px solid #30363D' : 'none',
              }}>
                <div>
                  <p style={{ color: '#E6EDF3', fontSize: '13px', margin: '0 0 2px' }}>{e.eventType}</p>
                  <p style={{ color: '#8B949E', fontSize: '11px', margin: 0 }}>{e.location}</p>
                </div>
                <span style={{ color: '#8B949E', fontSize: '11px', fontFamily: 'monospace', flexShrink: 0 }}>
                  {timeAgo(e.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px' }}>
            <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 16px' }}>
              TOP CORRIDORS BY MOVEMENT VOLUME
            </p>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={topCorridors} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#8B949E', fontSize: 10 }}
                  tickFormatter={(v) => v.split('→')[0].trim()} />
                <YAxis tick={{ fill: '#8B949E', fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#1e2530' }} />
                <Bar dataKey="dailyMovements" fill="#1A6B3C" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px' }}>
            <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 16px' }}>
              MOVEMENT TREND — LAST 24 HOURS
            </p>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={MOCK_HOURLY_MOVEMENTS} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#30363D" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: '#8B949E', fontSize: 10 }} interval={3} />
                <YAxis tick={{ fill: '#8B949E', fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="movements" stroke="#1A6B3C" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <InsightCallout
        borderColor="#1A6B3C"
        text="40,000 daily passenger movements between Ikorodu and Owutu with zero formal transit coverage. Highest priority gap for BRT expansion."
      />
    </div>
  );
}
