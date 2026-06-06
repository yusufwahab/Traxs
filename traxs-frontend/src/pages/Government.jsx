import { useState } from 'react';
import MetricCard from '../components/shared/MetricCard';
import InsightCallout from '../components/shared/InsightCallout';
import { MOCK_LGA_DATA, MOCK_POLICY_RESULTS } from '../data/mockData';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

const TOOLTIP_STYLE = { background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3', fontSize: '12px' };

const POLICY_TYPES = Object.keys(MOCK_POLICY_RESULTS);

function healthColor(score) {
  if (score >= 60) return '#1A6B3C';
  if (score >= 45) return '#F4A823';
  return '#DA3633';
}

function Sparkline({ values = [] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 60, h = 24;
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke="#1A6B3C" strokeWidth="1.5" />
    </svg>
  );
}

const cityHealthScore = Math.round(MOCK_LGA_DATA.reduce((s, l) => s + l.healthScore, 0) / MOCK_LGA_DATA.length);
const criticalLGAs    = MOCK_LGA_DATA.filter((l) => l.healthScore < 40);
const totalPopAffected = criticalLGAs.reduce((s, l) => s + l.population, 0);

const TREEMAP_DATA = MOCK_LGA_DATA.map((l) => ({ name: l.name, size: l.movements, score: l.healthScore }));

export default function Government() {
  const [form, setForm] = useState({ policyType: POLICY_TYPES[0], zone: '' });
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const runSim = async () => {
    if (!form.zone.trim()) return;
    setSimLoading(true);
    setSimResult(null);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const base = MOCK_POLICY_RESULTS[form.policyType];
    setSimResult({
      ...base,
      recommendation: `Simulating "${form.policyType}" in ${form.zone}: ${base.recommendation}`,
    });
    setSimLoading(false);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#E6EDF3', margin: 0 }}>
          City Mobility Health
        </h1>
        <p style={{ color: '#8B949E', fontSize: '13px', margin: '4px 0 0' }}>
          Lagos State — Policy Intelligence Layer
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <MetricCard
          label="City Mobility Health Score"
          value={cityHealthScore}
          color={healthColor(cityHealthScore)}
          subtitle="0 = collapsed, 100 = optimal"
        />
        <MetricCard label="LGAs with Critical Gaps"   value={criticalLGAs.length}    color="#DA3633" />
        <MetricCard
          label="Population Affected"
          value={`${(totalPopAffected / 1000000).toFixed(1)}M`}
          color="#F4A823"
        />
        <MetricCard label="Active Policy Simulations" value={3} />
      </div>

      {/* LGA Grid */}
      <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 14px' }}>
        LGA BREAKDOWN
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {MOCK_LGA_DATA.map((lga) => (
          <div key={lga.name} style={{
            background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '16px',
            borderTop: `2px solid ${healthColor(lga.healthScore)}`,
          }}>
            <p style={{ color: '#E6EDF3', fontSize: '13px', fontWeight: 600, margin: '0 0 4px' }}>{lga.name}</p>
            <p style={{ color: healthColor(lga.healthScore), fontFamily: 'monospace', fontSize: '22px', margin: '0 0 8px' }}>
              {lga.healthScore}
            </p>
            <p style={{ color: '#8B949E', fontSize: '11px', fontFamily: 'monospace', margin: '0 0 8px' }}>
              {lga.vehicles} vehicles · {lga.movements.toLocaleString()} movements
            </p>
            <Sparkline values={lga.trend} />
          </div>
        ))}
      </div>

      {/* Equity Treemap */}
      <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 14px' }}>
        EQUITY MAP — POPULATION vs TRANSIT ACCESS
      </p>
      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px', marginBottom: '32px' }}>
        <ResponsiveContainer width="100%" height={220}>
          <Treemap
            data={TREEMAP_DATA}
            dataKey="size"
            nameKey="name"
            aspectRatio={4 / 3}
            content={({ x, y, width, height, name, score }) => {
              if (width < 20 || height < 20) return null;
              return (
                <g>
                  <rect x={x} y={y} width={width} height={height}
                    fill={healthColor(score)}
                    fillOpacity={0.12 + (score / 100) * 0.45}
                    stroke="#30363D" strokeWidth={1} />
                  {width > 60 && height > 28 && (
                    <text x={x + 8} y={y + 18} fill="#E6EDF3" fontSize={11}>{name}</text>
                  )}
                  {width > 60 && height > 44 && (
                    <text x={x + 8} y={y + 32} fill="#8B949E" fontSize={10} fontFamily="monospace">{score}</text>
                  )}
                </g>
              );
            }}
          >
            <Tooltip contentStyle={TOOLTIP_STYLE}
              formatter={(v, n, p) => [`Score: ${p.payload.score}`, p.payload.name]} />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {/* Policy Simulator */}
      <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 14px' }}>
        POLICY SIMULATOR
      </p>
      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ color: '#8B949E', fontSize: '11px', display: 'block', marginBottom: '6px' }}>POLICY TYPE</label>
            <select
              value={form.policyType}
              onChange={(e) => setForm((f) => ({ ...f, policyType: e.target.value }))}
              style={{ width: '100%', background: '#0D1117', border: '1px solid #30363D', color: '#E6EDF3', padding: '8px 10px', fontSize: '13px', borderRadius: '2px', cursor: 'pointer' }}
            >
              {POLICY_TYPES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#8B949E', fontSize: '11px', display: 'block', marginBottom: '6px' }}>ZONE / AREA</label>
            <input
              value={form.zone}
              onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}
              placeholder="e.g. Lagos Island"
              style={{ width: '100%', background: '#0D1117', border: '1px solid #30363D', color: '#E6EDF3', padding: '8px 10px', fontSize: '13px', borderRadius: '2px' }}
            />
          </div>
          <button
            onClick={runSim}
            disabled={simLoading || !form.zone.trim()}
            style={{
              background: simLoading ? '#1e2530' : '#1A6B3C', color: '#E6EDF3', border: 'none',
              padding: '8px 20px', fontSize: '13px', cursor: simLoading ? 'wait' : 'pointer',
              borderRadius: '2px', whiteSpace: 'nowrap', opacity: !form.zone.trim() ? 0.5 : 1,
            }}
          >
            {simLoading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>

        {simLoading && (
          <p style={{ color: '#8B949E', fontSize: '13px', margin: '20px 0 0', fontFamily: 'monospace' }}>
            Simulating impact across Lagos mobility network...
          </p>
        )}

        {simResult && !simLoading && (
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: '4px', padding: '16px' }}>
                <p style={{ color: '#8B949E', fontSize: '11px', margin: '0 0 6px' }}>MOVEMENTS DISRUPTED</p>
                <p style={{ color: simResult.movementsDisrupted > 0 ? '#DA3633' : '#1A6B3C', fontFamily: 'monospace', fontSize: '28px', margin: 0 }}>
                  {simResult.movementsDisrupted.toLocaleString()}
                </p>
              </div>
              <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: '4px', padding: '16px' }}>
                <p style={{ color: '#8B949E', fontSize: '11px', margin: '0 0 8px' }}>WARDS AFFECTED</p>
                {simResult.wardsAffected.length === 0
                  ? <p style={{ color: '#1A6B3C', fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>None</p>
                  : simResult.wardsAffected.map((w, i) => (
                    <p key={i} style={{ color: '#E6EDF3', fontSize: '12px', margin: '2px 0', fontFamily: 'monospace' }}>{w}</p>
                  ))
                }
              </div>
              <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: '4px', padding: '16px' }}>
                <p style={{ color: '#8B949E', fontSize: '11px', margin: '0 0 6px' }}>ALTERNATIVE COVERAGE</p>
                <p style={{ color: simResult.alternativeCoverage ? '#1A6B3C' : '#DA3633', fontFamily: 'monospace', fontSize: '16px', margin: 0 }}>
                  {simResult.alternativeCoverage ? 'AVAILABLE' : 'NOT AVAILABLE'}
                </p>
              </div>
            </div>
            <p style={{ color: '#E6EDF3', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              {simResult.recommendation}
            </p>
          </div>
        )}
      </div>

      <InsightCallout
        borderColor="#DA3633"
        text="Proposed okada restriction in Lagos Island: ~80,000 daily movements disrupted. 3 wards have no viable alternative. Recommend phased implementation with BRT supplementation."
      />
    </div>
  );
}
