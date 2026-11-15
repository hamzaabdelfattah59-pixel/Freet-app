# Freet

نظّم الخروجة: حسابات، دعوات، وقت وميزانية لكل واحد.

## الإعداد
1. اعمل مشروع على supabase.com، وافتح SQL Editor والصق محتوى `supabase/schema.sql` وشغّله.
2. Authentication > URL Configuration: ضيف `https://free8t.vercel.app/**` و`http://localhost:3000/**` في Redirect URLs.
3. (اختياري) فعّل Google من Authentication > Providers.
4. انسخ `.env.example` إلى `.env.local` وحط مفاتيح Settings > API Keys.
5. `npm install && npm run dev`
6. للنشر: ارفع الكود على GitHub واربطه بمشروع Vercel، وضيف نفس المتغيرين في Environment Variables.

## الخطوة الجاية
- تقسيم الفلوس بالعدل (جدول مصروفات لكل خروجة).
- تأكيد الخروجة بتصويت.
- تغيير اسم الحساب.
