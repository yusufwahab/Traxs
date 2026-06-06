export default function InsightCallout({ borderColor = '#1A6B3C', text }) {
  return (
    <div
      style={{
        background: '#161B22',
        border: '1px solid #30363D',
        borderLeft: `3px solid ${borderColor}`,
      }}
      className="p-4 rounded mt-6"
    >
      <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em' }} className="uppercase mb-2">Insight</p>
      <p style={{ color: '#E6EDF3', fontSize: '13px', lineHeight: '1.6' }}>{text}</p>
    </div>
  );
}
