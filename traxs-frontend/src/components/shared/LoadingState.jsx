export default function LoadingState({ rows = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="shimmer"
          style={{ height: '60px', borderRadius: '4px' }}
        />
      ))}
    </div>
  );
}
