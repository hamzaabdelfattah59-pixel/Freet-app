import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#0B3A5B', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ color: '#fff', fontSize: 240, display: 'flex' }}>Freet</div>
        <div style={{ position: 'absolute', left: 0, bottom: 0, width: 1200, height: 28, background: '#1FA971', display: 'flex' }} />
      </div>
    ),
    size
  );
}
