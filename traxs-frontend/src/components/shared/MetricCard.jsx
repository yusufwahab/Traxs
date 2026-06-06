export default function MetricCard({ label, value, trend, color = '#E6EDF3', subtitle }) {
  return (
    <div style={{ background: '#161B22', border: '1px solid #30363D' }} className="p-5 rounded">
      <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em' }} className="uppercase mb-2">{label}</p>
      <p style={{ color, fontFamily: 'monospace', fontSize: '2rem', lineHeight: 1 }} className="font-bold">
        {value ?? '—'}
      </p>
      {subtitle && <p style={{ color: '#8B949E', fontSize: '12px' }} className="mt-1">{subtitle}</p>}
      {trend !== undefined && (
        <p style={{ color: trend >= 0 ? '#1A6B3C' : '#DA3633', fontSize: '12px', fontFamily: 'monospace' }} className="mt-1">
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </p>
      )}
    </div>
  );
}
