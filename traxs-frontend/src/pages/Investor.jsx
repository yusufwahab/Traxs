import { useState } from 'react';
import MetricCard from '../components/shared/MetricCard';
import InsightCallout from '../components/shared/InsightCallout';
import CorridorBadge from '../components/shared/CorridorBadge';
import { MOCK_CORRIDORS } from '../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, CartesianGrid, ReferenceLine,
} from 'recharts';

const TOOLTIP_STYLE = { background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3', fontSize: '12px' };

const fmtNGN = (v) => v >= 1000000 ? `₦${(v / 1000000).toFixed(1)}M` : `₦${(v / 1000).toFixed(0)}K`;

const SCATTER_DATA = MOCK_CORRIDORS.map((c) => ({ name: c.name, demand: c.demandScore, supply: c.supplyScore }));

const METRICS = {
  totalCorridors: MOCK_CORRIDORS.length,
  highestLoadRoute: 'Ikorodu → Owutu',
  highestLoadPct: 91,
  avgRevenuePotential: Math.round(MOCK_CORRIDORS.reduce((s, c) => s + c.revenueEstimate, 0) / MOCK_CORRIDORS.length),
  underservedCount: MOCK_CORRIDORS.filter((c) => c.supplyScore < 45).length,
};

export default function Investor() {
  const [sortAsc, setSortAsc] = useState(false);

  const routes = [...MOCK_CORRIDORS]
    .sort((a, b) => sortAsc ? a.viabilityScore - b.viabilityScore : b.viabilityScore - a.viabilityScore)
    .map((c) => ({
      corridor: c.name,
      loadFactor: c.loadFactor,
      avgOccupancy: c.avgOccupancy,
      dailyMovements: c.dailyMovements,
      revenuePotential: c.revenueEstimate,
      viabilityScore: c.viabilityScore,
    }));

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#E6EDF3', margin: 0 }}>
          Investor Route Intelligence
        </h1>
        <p style={{ color: '#8B949E', fontSize: '13px', margin: '4px 0 0' }}>
          Route Viability &amp; Revenue Analysis
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <MetricCard label="Total Active Corridors"  value={METRICS.totalCorridors} />
        <MetricCard
          label="Highest Load Factor"
          value={`${METRICS.highestLoadPct}%`}
          subtitle={METRICS.highestLoadRoute}
          color="#1A6B3C"
        />
        <MetricCard label="Avg Revenue Potential"   value={fmtNGN(METRICS.avgRevenuePotential)} color="#F4A823" />
        <MetricCard label="Underserved Corridors"   value={METRICS.underservedCount}             color="#DA3633" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Viability Table */}
        <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: 0 }}>
              ROUTE VIABILITY TABLE
            </p>
            <button
              onClick={() => setSortAsc((v) => !v)}
              style={{ background: 'none', border: '1px solid #30363D', color: '#8B949E', fontSize: '11px', padding: '3px 8px', cursor: 'pointer', borderRadius: '2px' }}
            >
              Sort {sortAsc ? '↑' : '↓'}
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #30363D' }}>
                  {['Corridor', 'Load', 'Occ.', 'Movements', 'Revenue', 'Score'].map((h) => (
                    <th key={h} style={{ color: '#8B949E', fontWeight: 400, padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routes.map((r, i) => (
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
        </div>

        {/* Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px' }}>
            <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 16px' }}>
              REVENUE POTENTIAL BY CORRIDOR
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={routes} layout="vertical" margin={{ top: 0, right: 0, left: 60, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: '#8B949E', fontSize: 10 }} tickFormatter={fmtNGN} />
                <YAxis type="category" dataKey="corridor" tick={{ fill: '#8B949E', fontSize: 10 }}
                  tickFormatter={(v) => v.split('→')[0].trim()} width={60} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmtNGN} cursor={{ fill: '#1e2530' }} />
                <Bar dataKey="revenuePotential" fill="#F4A823" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px' }}>
            <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 4px' }}>
              DEMAND vs SUPPLY — INVESTMENT OPPORTUNITIES
            </p>
            <p style={{ color: '#8B949E', fontSize: '11px', margin: '0 0 12px' }}>
              Top-left quadrant = high demand, low supply
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart margin={{ top: 0, right: 0, left: -20, bottom: 16 }}>
                <CartesianGrid stroke="#30363D" strokeDasharray="3 3" />
                <XAxis dataKey="supply" name="Supply" type="number" domain={[0, 100]}
                  tick={{ fill: '#8B949E', fontSize: 10 }}
                  label={{ value: 'Supply Score', fill: '#8B949E', fontSize: 10, position: 'insideBottom', offset: -10 }} />
                <YAxis dataKey="demand" name="Demand" type="number" domain={[0, 100]}
                  tick={{ fill: '#8B949E', fontSize: 10 }} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div style={{ background: '#161B22', border: '1px solid #30363D', padding: '8px 12px', fontSize: '12px' }}>
                        <p style={{ color: '#E6EDF3', margin: '0 0 4px' }}>{p.name}</p>
                        <p style={{ color: '#8B949E', margin: 0, fontFamily: 'monospace' }}>D {p.demand} / S {p.supply}</p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine x={50} stroke="#30363D" strokeDasharray="4 4" />
                <ReferenceLine y={50} stroke="#30363D" strokeDasharray="4 4" />
                <Scatter
                  data={SCATTER_DATA}
                  shape={(props) => {
                    const isOpp = props.demand > 50 && props.supply < 50;
                    return (
                      <circle
                        cx={props.cx} cy={props.cy} r={7}
                        fill={isOpp ? '#DA3633' : '#30363D'}
                        stroke={isOpp ? '#DA3633' : '#8B949E'}
                        strokeWidth={1} fillOpacity={0.85}
                      />
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <InsightCallout
        borderColor="#F4A823"
        text="Ikorodu–Owutu corridor: 91% load factor, peak 17:00–20:00 daily. 20-vehicle operation = est. ₦6.8M/month revenue. Supply score of 18 signals immediate investment opportunity."
      />
    </div>
  );
}
