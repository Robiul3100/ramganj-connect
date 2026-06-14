# রামগঞ্জ সিটি — Ramganj Connect

> রামগঞ্জের সকল সেবা, খবর ও জরুরি তথ্য একটি অ্যাপে। PWA, বাংলা-প্রথম, অফলাইন-ফ্রেন্ডলি।

**Live:** [ramganj-city.vercel.app](https://ramganj-city.vercel.app)
**Owner:** [Robiul3100](https://github.com/Robiul3100)
**Stack:** React 18 + TypeScript + Vite + Supabase + Firebase FCM + Vercel

---

## ফিচার সমূহ

- **সেবা ক্যাটালগ** — ২৫+ রাউট, ইমার্জেন্সি, ব্লাড ব্যাংক, অফিস, টিউশন মিডিয়া
- **প্রশাসন প্যানেল** — সেবা, নিউজ, স্লাইডার, বিজ্ঞাপন, কুইজ, ইভেন্ট ম্যানেজমেন্ট
- **PWA** — ইনস্টলযোগ্য, অফলাইনে ব্যবহারযোগ্য
- **পুশ নোটিফিকেশন** — Firebase Cloud Messaging
- **রিয়েল-টাইম** — Supabase Realtime (সাইট সেটিংস, নোটিফিকেশন, স্লাইডার)
- **নামাজের সময়সূচি** — অটো-কম্পিউটেড (adhan lib) + বাংলা ক্যালেন্ডার
- **কুইজ সিস্টেম** — লিডারবোর্ড, অ্যাটেম্প্ট ট্র্যাকিং
- **লস্ট অ্যান্ড ফাউন্ড** — পাবলিক সাবমিশন + অ্যাডমিন অ্যাপ্রুভাল
- **রক্তদাতা** — অনুমোদিত ডোনার ডিরেক্টরি
- **ডার্ক/লাইট থিম** — অ্যাপল-স্টাইল ওয়াটারড্রপ ট্রানজিশন
- **মেইনটেন্যান্স মোড** — অ্যাডমিন-নিয়ন্ত্রিত সাইট-ওয়াইড টগল

---

## টেকনোলজি

| ক্যাটাগরি | টেক |
|---|---|
| ফ্রন্টএন্ড | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| রাউটিং | React Router 6 |
| স্টেট/ডেটা | TanStack Query |
| ব্যাকএন্ড | Supabase (Postgres + Auth + Realtime + Storage + Edge Functions) |
| পুশ | Firebase Cloud Messaging (FCM) |
| PWA | vite-plugin-pwa (Workbox) |
| ডিপ্লয় | Vercel (SPA rewrite) |
| প্যাকেজ ম্যানেজার | Bun (recommended) or npm |

---

## লোকাল ডেভেলপমেন্ট সেটআপ

### প্রিরিকোয়াইজিট
- Node.js 20+
- (ঐচ্ছিক) Bun — [install](https://bun.sh)
- (ঐচ্ছিক) Supabase CLI — [install](https://supabase.com/docs/guides/cli)

### ধাপসমূহ

```sh
# 1. ক্লোন
git clone https://github.com/Robiul3100/ramganj-connect.git
cd ramganj-connect

# 2. ডিপেন্ডেন্সি ইনস্টল
bun install
# অথবা: npm install

# 3. এনভায়রনমেন্ট ভেরিয়েবল
cp .env.example .env
# .env ফাইলে Supabase ও Firebase এর আসল মান বসান

# 4. ডেভ সার্ভার চালু
bun run dev
# অথবা: npm run dev
# → http://localhost:8080

# 5. প্রোডাকশন বিল্ড
bun run build

# 6. প্রিভিউ বিল্ড
bun run preview
```

### স্ক্রিপ্টসমূহ
- `dev` — Vite dev server (HMR, port 8080, host 127.0.0.1)
- `build` — প্রোডাকশন বিল্ড → `dist/`
- `build:dev` — ডেভেলপমেন্ট mode-এ বিল্ড
- `lint` — ESLint চেক
- `test` / `test:watch` — Vitest

---

## Supabase সেটআপ

1. [supabase.com](https://supabase.com) এ নতুন প্রজেক্ট তৈরি করুন
2. `supabase/migrations/` ফোল্ডারের সব SQL ফাইল ক্রমে চালান (ড্যাশবোর্ডের SQL Editor দিয়ে)
3. `Authentication → Providers` এ ইমেইল পাসওয়ার্ড চালু আছে কিনা দেখুন
4. `Settings → API` থেকে URL, anon key, project id কপি করে `.env`-এ বসান
5. **প্রথম অ্যাডমিন তৈরি:**
   - `SETUP_ADMIN_SECRET` সেট করুন Supabase Edge Function secrets-এ
   - `ADMIN_OWNER_EMAIL` সেট করুন
   - `setup-admin` edge function deploy করুন
   - `curl` বা `AdminLogin?setup=1` UI দিয়ে প্রথম admin invite করুন
   - সফল হলে `setup-admin` function ডিলিট/আন-ডিপ্লয় করুন

---

## Firebase FCM সেটআপ

1. [Firebase Console](https://console.firebase.google.com) এ প্রজেক্ট তৈরি
2. Project Settings → Cloud Messaging → Web Push certificates → Generate key pair
3. Web app যোগ করুন, config মানগুলো `.env`-এ বসান
4. Supabase Edge Function secrets-এ যোগ করুন:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (নিউলাইন escape সহ)

---

## ডিপ্লয় (Vercel)

1. [vercel.com](https://vercel.com) এ GitHub রিপো কানেক্ট করুন
2. Build command: `bun run build` (অথবা `npm run build`)
3. Output dir: `dist`
4. Environment variables সেট করুন (উপরে দেখুন)
5. `vercel.json` এ SPA rewrite আছে — কোনো অতিরিক্ত কনফিগার লাগবে না

---

## অ্যাডমিন অ্যাকাউন্ট তৈরি

প্রথম অ্যাডমিন (ওনার) তৈরি করতে `/admin-login?setup=1` URL-এ যান।
পরবর্তী অ্যাডমিনরা: Supabase Dashboard → Authentication → Users → Add user → SQL এ `user_roles` insert।

⚠️ **গুরুত্বপূর্ণ:** `setup-admin` Edge Function ডিপ্লয় করার সময় অবশ্যই `SETUP_ADMIN_SECRET` ও `ADMIN_OWNER_EMAIL` env var সেট করুন। প্রথম admin তৈরির পর function আন-ডিপ্লয়/ডিলিট করুন।

---

## সিকিউরিটি নোটস

- `user_roles` টেবিলে RLS enable আছে; admin role `has_role()` SQL function দিয়ে চেক হয়
- ব্লাড ডোনার, লস্ট-ফাউন্ড-এর ফোন নম্বর পাবলিক-রিডেবল (intentional — যাতে যোগাযোগ করা যায়)
- কুইজ অ্যাটেম্প্টে নাম/ফোন PII থেকে রক্ষায় `public_quiz_leaderboard` view ব্যবহার করুন (শুধু স্কোর + সময়)
- Supabase anon key client-side-এ exposed — এটা design, কিন্তু production deployment-এ প্রজেক্ট ID ও row-level policy সঠিকভাবে configure করুন

---

## কন্ট্রিবিউটিং

1. Fork করুন
2. Feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Pull Request খুলুন

ESLint + TypeScript strict mode ব্যবহার করুন। নতুন query-তে `any` avoid করুন, schema type ব্যবহার করুন।

---

## লাইসেন্স

© 2026 Ramganj City Organisation. সকল অধিকার সংরক্ষিত।

---

**তৈরি করেছে** [রবিউল ইসলাম ইদরিস](https://github.com/Robiul3100) (RSF ROBIUL)