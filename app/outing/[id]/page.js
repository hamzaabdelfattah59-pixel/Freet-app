'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { bestWindows } from '@/lib/overlap';

const fmt = (d) =>
  new Date(d).toLocaleString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default function OutingPage() {
  const { id } = useParams();
  const [supabase] = useState(() => createClient());
  const [me, setMe] = useState(null);
  const [outing, setOuting] = useState(null);
  const [members, setMembers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [budget, setBudget] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setMe(user?.id);
    const [o, m, s] = await Promise.all([
      supabase.from('outings').select('*').eq('id', id).single(),
      supabase.from('members').select('user_id,budget,profiles(name)').eq('outing_id', id),
      supabase.from('slots').select('*').eq('outing_id', id).order('starts_at'),
    ]);
    setOuting(o.data);
    setMembers(m.data || []);
    setSlots(s.data || []);
    const mine = (m.data || []).find((x) => x.user_id === user?.id);
    setBudget((cur) => (cur === '' && mine?.budget != null ? String(mine.budget) : cur));
  }, [supabase, id]);

  useEffect(() => {
    load();
    const ch = supabase.channel(`outing-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slots', filter: `outing_id=eq.${id}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members', filter: `outing_id=eq.${id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [supabase, id, load]);

  async function saveBudget() {
    const { error } = await supabase.from('members').update({ budget: Number(budget) }).eq('outing_id', id).eq('user_id', me);
    setMsg(error ? 'معرفناش نحفظ الميزانية.' : 'اتحفظت الميزانية.');
    load();
  }
  async function addSlot(e) {
    e.preventDefault();
    const { error } = await supabase.from('slots').insert({
      outing_id: id, starts_at: new Date(start).toISOString(), ends_at: new Date(end).toISOString(),
    });
    setMsg(error ? 'وقت النهاية لازم يكون بعد البداية.' : '');
    if (!error) { setStart(''); setEnd(''); }
    load();
  }
  const delSlot = async (sid) => { await supabase.from('slots').delete().eq('id', sid); load(); };

  if (!outing) return <main><p className="sub">جاري التحميل…</p></main>;

  const name = (uid) => members.find((m) => m.user_id === uid)?.profiles?.name || 'صديق';
  const link = `${location.origin}/join/${outing.invite_code}`;
  const windows = bestWindows(slots).slice(0, 3);
  const budgets = members.map((m) => m.budget).filter((b) => b != null);
  const common = budgets.length ? Math.min(...budgets) : null;

  return (
    <>
      <header className="top"><Link href="/dashboard">‹ خروجاتي</Link><b>Freet</b></header>
      <main>
        <h1>{outing.title}</h1>
        {outing.place && <p className="sub">{outing.place}</p>}

        <div className="card">
          <h2>ادعي أصحابك</h2>
          <div className="actions">
            <a className="btn" target="_blank" rel="noreferrer"
              href={`https://wa.me/?text=${encodeURIComponent(`تعالى نظّم خروجة "${outing.title}" على Freet: ${link}`)}`}>
              ابعت على واتساب
            </a>
            <button className="ghost" onClick={() => navigator.clipboard.writeText(link).then(() => setMsg('اللينك اتنسخ.'))}>
              انسخ اللينك
            </button>
          </div>
        </div>

        <div className="card best">
          <h2>أنسب وقت</h2>
          {windows.length === 0 ? <p className="sub">أول ما الكل يضيف أوقاته هتظهر هنا أنسب مواعيد.</p>
            : windows.map((w, i) => (
              <div className="row" key={i}>
                <span>{fmt(w.from)} ← {fmt(w.to)}</span>
                <span className="tag">{w.who.length} من {members.length} فاضيين</span>
              </div>
            ))}
          {common != null && <p style={{ marginTop: 10 }}>أعلى ميزانية تناسب الكل: <span className="budget">{common} ج</span></p>}
        </div>

        <div className="card">
          <h2>ميزانيتي</h2>
          <input type="number" min="0" inputMode="numeric" placeholder="أقصى مبلغ تقدر تدفعه بالجنيه" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <button onClick={saveBudget} disabled={budget === ''}>احفظ الميزانية</button>
        </div>

        <div className="card">
          <h2>أوقاتي الفاضية</h2>
          <form onSubmit={addSlot}>
            <label htmlFor="s">من</label>
            <input id="s" type="datetime-local" required value={start} onChange={(e) => setStart(e.target.value)} />
            <label htmlFor="e">إلى</label>
            <input id="e" type="datetime-local" required value={end} onChange={(e) => setEnd(e.target.value)} />
            <button type="submit">ضيف الوقت</button>
          </form>
          {slots.filter((s) => s.user_id === me).map((s) => (
            <div className="row" key={s.id}>
              <span>{fmt(s.starts_at)} ← {fmt(s.ends_at)}</span>
              <button className="ghost" onClick={() => delSlot(s.id)}>مسح</button>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>المشاركين ({members.length})</h2>
          {members.map((m) => (
            <div className="row" key={m.user_id}>
              <span>{m.profiles?.name}{m.user_id === me && ' (أنت)'}</span>
              <span className="budget">{m.budget != null ? `${m.budget} ج` : '—'}</span>
            </div>
          ))}
        </div>
        {msg && <p className="sub" role="status" style={{ marginTop: 12 }}>{msg}</p>}
      </main>
    </>
  );
}
