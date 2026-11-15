import { ImageResponse } from 'next/og';

export function brandIcon(s) {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#0B3A5B', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ color: '#fff', fontSize: s * 0.62, display: 'flex' }}>F</div>
        <div style={{ position: 'absolute', right: s * 0.19, bottom: s * 0.19, width: s * 0.14, height: s * 0.14, borderRadius: s, background: '#1FA971' }} />
      </div>
    ),
    { width: s, height: s }
  );
}
