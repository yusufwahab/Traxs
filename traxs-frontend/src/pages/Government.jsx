import { useState, useEffect } from 'react';
import MetricCard from '../components/shared/MetricCard';
import InsightCallout from '../components/shared/InsightCallout';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { MOCK_LGA_DATA, MOCK_POLICY_RESULTS } from '../data/mockData';

const API = import.meta.env.VITE_API_BASE_URL;
const TOOLTIP_STYLE = { background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3', fontSize: '12px' };

const POLICY_TYPES = ['Ban Okada in Zone', 'Close Road Corridor', 'Add BRT Route', 'Restrict Night Movement'];

const FALLBACK_CITY_HEALTH = {
  mobilityHealthScore: Math.round(MOCK_LGA_DATA.reduce((s, l) => s + l.healthScore, 0) / MOCK_LGA_DATA.length),
  activeDrivers: 7,
  activeVehicles: 5,
  lgaBreakdown: MOCK_LGA_DATA.map(l => ({ lga: l.name, activeVehicles: l.vehicles, transitScore: l.transitAccessScore })),
  equityIndex: MOCK_LGA_DATA.filter(l => l.transitAccessScore < 40).map(l => ({
    lga: l.name, activeVehicles: l.vehicles, transitScore: l.transitAccessScore, flag: 'poor_transit_access',
  })),
};

function getMockSimResult(policyType) {
  const mock = MOCK_POLICY_RESULTS[policyType];
  if (!mock) return null;
  return {
    estimatedPassengersDisrupted: mock.movementsDisrupted,
    affectedWards: mock.wardsAffected,
    riskLevel: mock.movementsDisrupted > 50000 ? 'High' : mock.movementsDisrupted > 20000 ? 'Medium' : 'Low',
    alternativeCoverageAvailable: mock.alternativeCoverage
      ? 'Yes — alternative routes available'
      : 'Limited — no direct alternative currently available',
    recommendation: mock.recommendation,
  };
}

function healthColor(score) {
  if (score >= 60) return '#1A6B3C';
  if (score >= 45) return '#F4A823';
  return '#DA3633';
}

export default function Government() {
  const [cityHealth, setCityHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ policyType: POLICY_TYPES[0], zone: '' });
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/intelligence/government/city-health`)
      .then(r => r.json())
      .then(json => { setCityHealth(json.success && json.data ? json.data : FALLBACK_CITY_HEALTH); })
      .catch(() => setCityHealth(FALLBACK_CITY_HEALTH))
      .finally(() => setLoading(false));
  }, []);

  const runSim = async () => {
    if (!form.zone.trim()) return;
    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await fetch(`${API}/api/intelligence/government/simulate-policy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: form.policyType, zone: form.zone }),
      });
      const json = await res.json();
      setSimResult(json.success && json.data ? json.data : getMockSimResult(form.policyType));
    } catch {
      setSimResult(getMockSimResult(form.policyType));
    } finally {
      setSimLoading(false);
    }
  };

  const lgaBreakdown = cityHealth?.lgaBreakdown || [];
  const criticalLGAs = lgaBreakdown.filter(l => (l.transitScore || 0) < 40);
  const treemapData = lgaBreakdown.map(l => ({ name: l.lga, size: l.activeVehicles || 1, score: l.transitScore || 0 }));

  const METRICS = {
    healthScore: cityHealth?.mobilityHealthScore || 0,
    activeDrivers: cityHealth?.activeDrivers || 0,
    activeVehicles: cityHealth?.activeVehicles || 0,
    criticalCount: criticalLGAs.length,
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#E6EDF3', margin: 0 }}>City Mobility Health</h1>
        <p style={{ color: '#8B949E', fontSize: '13px', margin: '4px 0 0' }}>
          Lagos State — Policy Intelligence Layer {loading && '· Loading...'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <MetricCard
          label="City Mobility Health Score"
          value={METRICS.healthScore}
          color={healthColor(METRICS.healthScore)}
          subtitle="0 = collapsed, 100 = optimal"
        />
        <MetricCard label="LGAs with Critical Gaps" value={METRICS.criticalCount}   color="#DA3633" />
        <MetricCard label="Active Drivers"           value={METRICS.activeDrivers}   color="#1A6B3C" />
        <MetricCard label="Active Vehicles"          value={METRICS.activeVehicles} />
      </div>

      {/* LGA Grid */}
      <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 14px' }}>LGA BREAKDOWN</p>
      {loading
        ? <p style={{ color: '#8B949E', fontSize: '13px', marginBottom: '32px' }}>Loading LGA data...</p>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
            {lgaBreakdown.map((lga) => (
              <div key={lga.lga} style={{
                background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '16px',
                borderTop: `2px solid ${healthColor(lga.transitScore || 0)}`,
              }}>
                <p style={{ color: '#E6EDF3', fontSize: '13px', fontWeight: 600, margin: '0 0 4px' }}>{lga.lga}</p>
                <p style={{ color: healthColor(lga.transitScore || 0), fontFamily: 'monospace', fontSize: '22px', margin: '0 0 8px' }}>
                  {lga.transitScore || 0}
                </p>
                <p style={{ color: '#8B949E', fontSize: '11px', fontFamily: 'monospace', margin: 0 }}>
                  {lga.activeVehicles} vehicles active
                </p>
              </div>
            ))}
          </div>
        )}

      {/* Equity Treemap */}
      <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 14px' }}>
        EQUITY MAP — VEHICLES vs TRANSIT ACCESS
      </p>
      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px', marginBottom: '32px' }}>
        <ResponsiveContainer width="100%" height={220}>
          <Treemap data={treemapData} dataKey="size" nameKey="name" aspectRatio={4 / 3}
            content={({ x, y, width, height, name, score }) => {
              if (width < 20 || height < 20) return null;
              return (
                <g>
                  <rect x={x} y={y} width={width} height={height}
                    fill={healthColor(score)} fillOpacity={0.12 + (score / 100) * 0.45}
                    stroke="#30363D" strokeWidth={1} />
                  {width > 60 && height > 28 && <text x={x + 8} y={y + 18} fill="#E6EDF3" fontSize={11}>{name}</text>}
                  {width > 60 && height > 44 && <text x={x + 8} y={y + 32} fill="#8B949E" fontSize={10} fontFamily="monospace">{score}</text>}
                </g>
              );
            }}>
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n, p) => [`Score: ${p.payload.score}`, p.payload.name]} />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {/* Policy Simulator */}
      <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 14px' }}>POLICY SIMULATOR</p>
      <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ color: '#8B949E', fontSize: '11px', display: 'block', marginBottom: '6px' }}>POLICY TYPE</label>
            <select value={form.policyType} onChange={(e) => setForm(f => ({ ...f, policyType: e.target.value }))}
              style={{ width: '100%', background: '#0D1117', border: '1px solid #30363D', color: '#E6EDF3', padding: '8px 10px', fontSize: '13px', borderRadius: '2px', cursor: 'pointer' }}>
              {POLICY_TYPES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#8B949E', fontSize: '11px', display: 'block', marginBottom: '6px' }}>ZONE / AREA</label>
            <input value={form.zone} onChange={(e) => setForm(f => ({ ...f, zone: e.target.value }))}
              placeholder="e.g. Lagos Island"
              style={{ width: '100%', background: '#0D1117', border: '1px solid #30363D', color: '#E6EDF3', padding: '8px 10px', fontSize: '13px', borderRadius: '2px' }} />
          </div>
          <button onClick={runSim} disabled={simLoading || !form.zone.trim()}
            style={{
              background: simLoading ? '#1e2530' : '#1A6B3C', color: '#E6EDF3', border: 'none',
              padding: '8px 20px', fontSize: '13px', cursor: simLoading ? 'wait' : 'pointer',
              borderRadius: '2px', whiteSpace: 'nowrap', opacity: !form.zone.trim() ? 0.5 : 1,
            }}>
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
                <p style={{ color: simResult.estimatedPassengersDisrupted > 0 ? '#DA3633' : '#1A6B3C', fontFamily: 'monospace', fontSize: '28px', margin: 0 }}>
                  {(simResult.estimatedPassengersDisrupted || 0).toLocaleString()}
                </p>
              </div>
              <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: '4px', padding: '16px' }}>
                <p style={{ color: '#8B949E', fontSize: '11px', margin: '0 0 8px' }}>WARDS AFFECTED</p>
                {(simResult.affectedWards || []).map((w, i) => (
                  <p key={i} style={{ color: '#E6EDF3', fontSize: '12px', margin: '2px 0', fontFamily: 'monospace' }}>{w}</p>
                ))}
              </div>
              <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: '4px', padding: '16px' }}>
                <p style={{ color: '#8B949E', fontSize: '11px', margin: '0 0 6px' }}>RISK LEVEL</p>
                <p style={{ color: simResult.riskLevel === 'High' ? '#DA3633' : '#F4A823', fontFamily: 'monospace', fontSize: '16px', margin: 0 }}>
                  {simResult.riskLevel}
                </p>
                <p style={{ color: '#8B949E', fontSize: '11px', margin: '6px 0 0' }}>{simResult.alternativeCoverageAvailable}</p>
              </div>
            </div>
            <p style={{ color: '#E6EDF3', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{simResult.recommendation}</p>
          </div>
        )}
      </div>

      <InsightCallout
        borderColor="#DA3633"
        text={criticalLGAs.length > 0
          ? `${criticalLGAs.map(l => l.lga).join(', ')} have critical transit access scores below 40. These LGAs represent the highest-priority targets for policy intervention.`
          : 'All LGAs currently above critical threshold. Continue monitoring for demand-supply gaps.'}
      />
    </div>
  );
}
