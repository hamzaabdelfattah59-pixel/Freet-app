import html from '@/lib/freetHtml';

export const dynamic = 'force-dynamic';

export function GET(request) {
  const origin = new URL(request.url).origin;
  const body = html
    .replaceAll('__SB_URL__', process.env.NEXT_PUBLIC_SUPABASE_URL)
    .replaceAll('__SB_KEY__', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
    .replaceAll('__ORIGIN__', origin);
  return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
