export default function manifest() {
  return {
    name: 'Freet',
    short_name: 'Freet',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B3A5B',
    theme_color: '#0B3A5B',
    icons: [{ src: '/icon', sizes: '512x512', type: 'image/png' }],
  };
}
