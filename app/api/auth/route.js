export const dynamic = 'force-dynamic';

const J = (o, s = 200) => Response.json(o, { status: s });

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const base = process.env.FREET_ALIAS_EMAIL || 'hamzaabdelfattah59@gmail.com';

  let b;
  try { b = await request.json(); } catch { return J({ error: 'bad_request' }, 400); }

  const mode = b.mode;
  const password = String(b.password || '');
  const raw = String(b.username || '').trim().toLowerCase().replace(/^@/, '');

  let email;
  if (mode === 'login' && raw.includes('@')) {
    email = raw; // حسابات قديمة اتعملت بإيميل
  } else {
    if (!/^[a-z0-9_]{2,20}$/.test(raw)) return J({ error: 'username_invalid' }, 400);
    if (!base || !base.includes('@')) return J({ error: 'alias_missing' }, 500);
    const [local, domain] = base.trim().toLowerCase().split('@');
    email = `${local.split('+')[0]}+${raw}@${domain}`;
  }
  if (password.length < 6) return J({ error: 'weak_password' }, 400);

  const headers = { apikey: key, 'content-type': 'application/json' };
  const r = mode === 'signup'
    ? await fetch(`${url}/auth/v1/signup`, {
        method: 'POST', headers,
        body: JSON.stringify({ email, password, data: { full_name: String(b.name || raw).slice(0, 40), username: raw } }),
      })
    : await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST', headers, body: JSON.stringify({ email, password }),
      });

  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const code = j.error_code || j.code || '';
    const msg = String(j.msg || j.message || j.error_description || '');
    if (mode === 'signup' && (code === 'user_already_exists' || /already registered/i.test(msg))) return J({ error: 'taken' }, 409);
    if (mode === 'login') return J({ error: 'bad_credentials' }, 401);
    if (code === 'weak_password') return J({ error: 'weak_password' }, 400);
    return J({ error: msg || 'failed' }, 400);
  }
  if (!j.access_token) return J({ error: 'confirm_required' }, 400);
  return J({ access_token: j.access_token, refresh_token: j.refresh_token });
}
