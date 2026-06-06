export default function LiveBadge({ label = 'LIVE' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span
        className="pulse-dot"
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#1A6B3C',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      <span style={{ color: '#1A6B3C', fontSize: '11px', letterSpacing: '0.1em' }}>{label}</span>
    </span>
  );
}
