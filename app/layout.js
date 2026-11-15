import './globals.css';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';

const font = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '700'] });

export const metadata = {
  title: 'Freet',
  description: 'اعرف مين فاضي، نظّم الخروجة، اقسم الفلوس بالعدل',
  appleWebApp: { capable: true, title: 'Freet' },
};
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0B3A5B' };

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={font.className}>{children}</body>
    </html>
  );
}
