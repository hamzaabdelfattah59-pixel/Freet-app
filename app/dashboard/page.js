'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function Dashboard() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [outings, setOutings] = useState(null);
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('outings').select('id,title,place,created_at').order('created_at', { ascending: false })
      .then(({ data }) => setOutings(data || []));
  }, [supabase]);

  async function create(e) {
    e.preventDefault();
    setError('');
    const { data, error } = await supabase.from('outings').insert({ title, place: place || null }).select('id').single();
    if (error) return setError('معرفناش نعمل الخروجة. جرّب تاني.');
    router.push(`/outing/${data.id}`);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <>
      <header className="top"><b>Freet</b><button className="link" onClick={signOut}>خروج</button></header>
      <main>
        <div className="card">
          <h2>خروجة جديدة</h2>
          <form onSubmit={create}>
            <input required placeholder="اسم الخروجة (مثلاً: عشا الجمعة)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input placeholder="المكان (اختياري)" value={place} onChange={(e) => setPlace(e.target.value)} />
            <button type="submit">اعمل الخروجة</button>
            {error && <p className="err">{error}</p>}
          </form>
        </div>
        <h2 style={{ marginTop: 24 }}>خروجاتك</h2>
        {outings === null ? <p className="sub">جاري التحميل…</p>
          : outings.length === 0 ? <p className="sub">لسه معندكش خروجات. اعمل أول واحدة من فوق.</p>
          : outings.map((o) => (
            <Link key={o.id} href={`/outing/${o.id}`} style={{ textDecoration: 'none' }}>
              <div className="card"><b>{o.title}</b>{o.place && <div className="sub">{o.place}</div>}</div>
            </Link>
          ))}
      </main>
    </>
  );
}
