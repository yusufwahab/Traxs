export default function CorridorBadge({ score }) {
  const high = score >= 70;
  const mid = score >= 40;
  const color = high ? '#1A6B3C' : mid ? '#F4A823' : '#DA3633';
  const label = high ? 'HIGH' : mid ? 'MED' : 'LOW';
  return (
    <span
      style={{
        color,
        border: `1px solid ${color}`,
        fontSize: '10px',
        letterSpacing: '0.08em',
        padding: '2px 6px',
        borderRadius: '2px',
        fontFamily: 'monospace',
      }}
    >
      {label}
    </span>
  );
}
