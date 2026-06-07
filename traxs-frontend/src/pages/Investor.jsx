import { useState, useEffect } from 'react';
import MetricCard from '../components/shared/MetricCard';
import InsightCallout from '../components/shared/InsightCallout';
import CorridorBadge from '../components/shared/CorridorBadge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, CartesianGrid, ReferenceLine,
} from 'recharts';

import { MOCK_CORRIDORS } from '../data/mockData';

const API = import.meta.env.VITE_API_BASE_URL;
const TOOLTIP_STYLE = { background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3', fontSize: '12px' };
const fmtNGN = (v) => v >= 1000 ? `₦${(v / 1000).toFixed(1)}M` : `₦${v}K`;

const FALLBACK_ROUTES = MOCK_CORRIDORS.map(c => ({
  corridorId: c.id,
  corridorName: c.name,
  loadFactor: c.loadFactor,
  averageOccupancy: c.avgOccupancy,
  passengerMovements: c.dailyMovements,
  estimatedRevenuePotentialKPerDay: Math.round(c.revenueEstimate / 1000),
  demandScore: c.demandScore,
  supplyScore: c.supplyScore,
  viabilityScore: c.viabilityScore,
}));

export default function Investor() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/intelligence/investor/routes`)
      .then(r => r.json())
      .then(json => { setRoutes(json.success && json.data?.length ? json.data : FALLBACK_ROUTES); })
      .catch(() => setRoutes(FALLBACK_ROUTES))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...routes].sort((a, b) =>
    sortAsc ? a.viabilityScore - b.viabilityScore : b.viabilityScore - a.viabilityScore
  );

  const tableRows = sorted.map(r => ({
    corridor: r.corridorName,
    loadFactor: r.loadFactor,
    avgOccupancy: r.averageOccupancy,
    dailyMovements: r.passengerMovements || 0,
    revenuePotential: r.estimatedRevenuePotentialKPerDay || 0,
    viabilityScore: r.viabilityScore,
  }));

  const scatterData = routes.map(r => ({ name: r.corridorName, demand: r.demandScore, supply: r.supplyScore }));

  const METRICS = {
    totalCorridors: routes.length,
    highestLoad: sorted[0] ? { name: sorted[0].corridorName, pct: sorted[0].loadFactor } : { name: '—', pct: 0 },
    avgRevenue: routes.length
      ? Math.round(routes.reduce((s, r) => s + (r.estimatedRevenuePotentialKPerDay || 0), 0) / routes.length)
      : 0,
    underserved: routes.filter(r => r.supplyScore < 45).length,
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#E6EDF3', margin: 0 }}>
          Investor Route Intelligence
        </h1>
        <p style={{ color: '#8B949E', fontSize: '13px', margin: '4px 0 0' }}>
          Route Viability &amp; Revenue Analysis {loading && '· Loading...'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <MetricCard label="Total Active Corridors"  value={METRICS.totalCorridors} />
        <MetricCard
          label="Highest Load Factor"
          value={`${METRICS.highestLoad.pct}%`}
          subtitle={METRICS.highestLoad.name}
          color="#1A6B3C"
        />
        <MetricCard label="Avg Revenue Potential" value={fmtNGN(METRICS.avgRevenue)} color="#F4A823" />
        <MetricCard label="Underserved Corridors"  value={METRICS.underserved}      color="#DA3633" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Viability Table */}
        <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: 0 }}>ROUTE VIABILITY TABLE</p>
            <button onClick={() => setSortAsc(v => !v)}
              style={{ background: 'none', border: '1px solid #30363D', color: '#8B949E', fontSize: '11px', padding: '3px 8px', cursor: 'pointer', borderRadius: '2px' }}>
              Sort {sortAsc ? '↑' : '↓'}
            </button>
          </div>
          {loading
            ? <p style={{ color: '#8B949E', fontSize: '13px' }}>Loading corridors...</p>
            : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #30363D' }}>
                      {['Corridor', 'Load', 'Occ.', 'Movements', 'Revenue/day', 'Score'].map(h => (
                        <th key={h} style={{ color: '#8B949E', fontWeight: 400, padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1e2530' }}>
                        <td style={{ color: '#E6EDF3', padding: '8px', whiteSpace: 'nowrap' }}>{r.corridor}</td>
                        <td style={{ color: '#E6EDF3', fontFamily: 'monospace', padding: '8px' }}>{r.loadFactor}%</td>
                        <td style={{ color: '#8B949E', fontFamily: 'monospace', padding: '8px' }}>{r.avgOccupancy}</td>
                        <td style={{ color: '#8B949E', fontFamily: 'monospace', padding: '8px' }}>{r.dailyMovements.toLocaleString()}</td>
                        <td style={{ color: '#F4A823', fontFamily: 'monospace', padding: '8px' }}>{fmtNGN(r.revenuePotential)}</td>
                        <td style={{ padding: '8px' }}><CorridorBadge score={r.viabilityScore} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px' }}>
            <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 16px' }}>REVENUE POTENTIAL BY CORRIDOR</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={tableRows} layout="vertical" margin={{ top: 0, right: 0, left: 60, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: '#8B949E', fontSize: 10 }} tickFormatter={fmtNGN} />
                <YAxis type="category" dataKey="corridor" tick={{ fill: '#8B949E', fontSize: 10 }}
                  tickFormatter={(v) => v.split('–')[0].trim()} width={60} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmtNGN} cursor={{ fill: '#1e2530' }} />
                <Bar dataKey="revenuePotential" fill="#F4A823" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px' }}>
            <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 4px' }}>DEMAND vs SUPPLY — INVESTMENT OPPORTUNITIES</p>
            <p style={{ color: '#8B949E', fontSize: '11px', margin: '0 0 12px' }}>Top-left quadrant = high demand, low supply</p>
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart margin={{ top: 0, right: 0, left: -20, bottom: 16 }}>
                <CartesianGrid stroke="#30363D" strokeDasharray="3 3" />
                <XAxis dataKey="supply" name="Supply" type="number" domain={[0, 100]}
                  tick={{ fill: '#8B949E', fontSize: 10 }}
                  label={{ value: 'Supply Score', fill: '#8B949E', fontSize: 10, position: 'insideBottom', offset: -10 }} />
                <YAxis dataKey="demand" name="Demand" type="number" domain={[0, 100]} tick={{ fill: '#8B949E', fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div style={{ background: '#161B22', border: '1px solid #30363D', padding: '8px 12px', fontSize: '12px' }}>
                        <p style={{ color: '#E6EDF3', margin: '0 0 4px' }}>{p.name}</p>
                        <p style={{ color: '#8B949E', margin: 0, fontFamily: 'monospace' }}>D {p.demand} / S {p.supply}</p>
                      </div>
                    );
                  }} />
                <ReferenceLine x={50} stroke="#30363D" strokeDasharray="4 4" />
                <ReferenceLine y={50} stroke="#30363D" strokeDasharray="4 4" />
                <Scatter data={scatterData}
                  shape={(props) => {
                    const isOpp = props.demand > 50 && props.supply < 50;
                    return <circle cx={props.cx} cy={props.cy} r={7} fill={isOpp ? '#DA3633' : '#30363D'} stroke={isOpp ? '#DA3633' : '#8B949E'} strokeWidth={1} fillOpacity={0.85} />;
                  }} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {sorted[0] && (
        <InsightCallout
          borderColor="#F4A823"
          text={`${sorted[0].corridorName}: ${sorted[0].loadFactor}% load factor. Supply score of ${sorted[0].supplyScore} signals immediate investment opportunity with est. ₦${sorted[0].estimatedRevenuePotentialKPerDay}K/day revenue potential.`}
        />
      )}
    </div>
  );
}
