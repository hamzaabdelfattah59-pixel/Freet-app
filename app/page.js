import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');
  return (
    <main style={{ paddingTop: 80 }}>
      <h1>Freet</h1>
      <p className="sub">اعرف مين فاضي، نظّم الخروجة، اقسم الفلوس بالعدل</p>
      <div className="card">
        <h2>أهلاً بيك في Freet</h2>
        <p className="sub">اعمل حسابك وابدأ نظّم خروجتك</p>
        <Link className="btn" href="/login">ابدأ</Link>
      </div>
    </main>
  );
}
