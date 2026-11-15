// بيجيب أفضل أوقات يكون فيها أكبر عدد من الأصدقاء فاضيين
export function bestWindows(slots, minMinutes = 60) {
  const t = (d) => +new Date(d);
  const points = [...new Set(slots.flatMap((s) => [t(s.starts_at), t(s.ends_at)]))].sort((a, b) => a - b);
  const segs = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [a, b] = [points[i], points[i + 1]];
    const who = [...new Set(slots.filter((s) => t(s.starts_at) <= a && t(s.ends_at) >= b).map((s) => s.user_id))].sort();
    if (!who.length) continue;
    const last = segs[segs.length - 1];
    if (last && last.to === a && last.who.join() === who.join()) last.to = b;
    else segs.push({ from: a, to: b, who });
  }
  return segs
    .filter((s) => s.to - s.from >= minMinutes * 60000)
    .sort((x, y) => y.who.length - x.who.length || (y.to - y.from) - (x.to - x.from));
}
