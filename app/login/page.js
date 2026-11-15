'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Login() {
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = () => {
    const next = new URLSearchParams(window.location.search).get('next') || '/dashboard';
    return `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  };

  async function sendLink(e) {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
    if (error) setError('مقدرناش نبعت اللينك. راجع الإيميل وجرّب تاني.');
    else setSent(true);
  }

  return (
    <main style={{ paddingTop: 80 }}>
      <h1>سجّل دخولك</h1>
      <div className="card">
        {sent ? (
          <p>بعتنا لينك الدخول على <b>{email}</b>. افتحه من نفس الموبايل.</p>
        ) : (
          <form onSubmit={sendLink}>
            <label htmlFor="email">الإيميل</label>
            <input id="email" type="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="actions">
              <button type="submit">ابعتلي لينك الدخول</button>
              <button type="button" className="ghost"
                onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo() } })}>
                دخول بجوجل
              </button>
            </div>
            {error && <p className="err">{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
