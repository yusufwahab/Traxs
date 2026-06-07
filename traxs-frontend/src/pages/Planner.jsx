import { useState, useEffect } from 'react';
import MetricCard from '../components/shared/MetricCard';
import InsightCallout from '../components/shared/InsightCallout';
import { MOCK_HOURLY_MOVEMENTS } from '../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';

const API = import.meta.env.VITE_API_BASE_URL;
const TOOLTIP_STYLE = { background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3', fontSize: '12px' };

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function Planner() {
  const [data, setData] = useState({ ghostCorridors: [], heatmapData: [], congestionHotspots: [], vehiclesByZone: [] });
  const [routeEvents, setRouteEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/intelligence/planner/overview`).then(r => r.json()),
      fetch(`${API}/api/inference/events`).then(r => r.json()),
    ]).then(([overview, events]) => {
      if (overview.success) setData(overview.data);
      if (events.success) setRouteEvents(events.data);
    }).catch(err => console.error('Planner fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const ghostCorridors = data.ghostCorridors || [];
  const topCorridors = (data.heatmapData || []).map(s => ({
    name: s.corridorName,
    dailyMovements: s.passengerMovements,
    demandScore: s.demandScore,
  }));

  const METRICS = {
    totalMovements: topCorridors.reduce((s, c) => s + c.dailyMovements, 0),
    ghostCount: ghostCorridors.length,
    hotspots: routeEvents.length,
    coverageGapScore: ghostCorridors.length > 0
      ? Math.round(ghostCorridors.reduce((s, c) => s + (c.demandScore - c.supplyScore), 0) / ghostCorridors.length)
      : 0,
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#E6EDF3', margin: 0 }}>
          Urban Planner Intelligence
        </h1>
        <p style={{ color: '#8B949E', fontSize: '13px', margin: '4px 0 0' }}>
          Lagos Mobility Network — Live View {loading && '· Loading...'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <MetricCard label="Passenger Movements Today"  value={METRICS.totalMovements.toLocaleString()} />
        <MetricCard label="Active Ghost Corridors"     value={METRICS.ghostCount}        color="#F4A823" />
        <MetricCard label="Active Route Incidents"     value={METRICS.hotspots}          color="#DA3633" />
        <MetricCard
          label="Coverage Gap Score"
          value={METRICS.coverageGapScore}
          color="#DA3633"
          subtitle="0 = full coverage, 100 = critical gap"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Ghost Corridors */}
          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px' }}>
            <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 16px' }}>GHOST CORRIDORS</p>
            {ghostCorridors.length === 0 && !loading && (
              <p style={{ color: '#8B949E', fontSize: '13px', margin: 0 }}>No ghost corridors detected in the last 24 hours.</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ghostCorridors.map((c) => (
                <div key={c.corridorId} style={{
                  background: '#0D1117', border: '1px solid #30363D', borderRadius: '4px',
                  padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <p style={{ color: '#E6EDF3', fontSize: '13px', margin: '0 0 4px' }}>{c.corridorName}</p>
                    <p style={{ color: '#8B949E', fontSize: '11px', fontFamily: 'monospace', margin: 0 }}>
                      {(c.passengerMovements || 0).toLocaleString()} movements · Supply {c.supplyScore} · Demand {c.demandScore}
                    </p>
                  </div>
                  {c.demandScore > 70 && (
                    <span style={{
                      color: '#DA3633', border: '1px solid #DA3633', fontSize: '10px',
                      letterSpacing: '0.08em', padding: '2px 6px', borderRadius: '2px', fontFamily: 'monospace',
                    }}>HIGH PRIORITY</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Route Events */}
          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px' }}>
            <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 16px' }}>ACTIVE ROUTE EVENTS</p>
            {routeEvents.length === 0 && !loading && (
              <p style={{ color: '#8B949E', fontSize: '13px', margin: 0 }}>No active route events in the last 6 hours.</p>
            )}
            {routeEvents.map((e, i) => (
              <div key={e.eventId || i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: i < routeEvents.length - 1 ? '1px solid #30363D' : 'none',
              }}>
                <div>
                  <p style={{ color: '#E6EDF3', fontSize: '13px', margin: '0 0 2px' }}>
                    {e.eventType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                  <p style={{ color: '#8B949E', fontSize: '11px', margin: 0 }}>{e.description}</p>
                </div>
                <span style={{ color: '#8B949E', fontSize: '11px', fontFamily: 'monospace', flexShrink: 0 }}>
                  {timeAgo(e.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px' }}>
            <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 16px' }}>
              TOP CORRIDORS BY MOVEMENT VOLUME
            </p>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={topCorridors} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#8B949E', fontSize: 10 }}
                  tickFormatter={(v) => v.split('–')[0].trim()} />
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

      {ghostCorridors.length > 0 && (
        <InsightCallout
          borderColor="#1A6B3C"
          text={`${ghostCorridors[0]?.passengerMovements?.toLocaleString() || 0} passenger movements on the ${ghostCorridors[0]?.corridorName} corridor with a supply score of only ${ghostCorridors[0]?.supplyScore}. Highest priority gap for immediate intervention.`}
        />
      )}
    </div>
  );
}
