'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Join() {
  const { code } = useParams();
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    createClient().rpc('join_outing', { code }).then(({ data, error }) => {
      if (error) setFailed(true);
      else router.replace(`/outing/${data}`);
    });
  }, [code, router]);

  return (
    <main style={{ paddingTop: 80 }}>
      {failed ? <p className="err">كود الدعوة مش صحيح أو منتهي.</p> : <p className="sub">بنضيفك للخروجة…</p>}
    </main>
  );
}
