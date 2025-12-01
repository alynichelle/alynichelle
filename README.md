# Lilac Passion Project — Web-Only Starter Plan

This repo now includes a minimal **React + Vite** scaffold with themed sanctuary widgets so you can install dependencies and run
immediately. The shell is split into focused components to match your requested map:

```
src/
  main.jsx           # mounts React to the page
  App.jsx            # layout shell + theme toggle
  components/
    Affirmations.jsx # rotator + editable list with local storage
    Journal.jsx      # mini journal with autosave
    Breathe.jsx      # breathing loop stub
    SoundMixer.jsx   # ambient sound toggles + sliders (stubbed)
  styles/
    themes.css       # color tokens + light/dark/lavender themes
  index.css          # base imports + global sizing
index.html
```

## Environment setup (Supabase + Stripe)

1) **Local (.env)** — copy `.env.example` → `.env` and fill in your real values (do **not** commit them). Both `SUPABASE_*` and `EXPO_PUBLIC_SUPABASE_*` map to the same values so the Expo app can read them at runtime.
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```
Use the Supabase URL/anon key and Stripe publishable key from your own project; keep them out of git.

2) **Expo EAS Secrets (CI)** — add these exact names (referenced in `app.json` / `eas.json`):
- `supabase_url`
- `supabase_anon_key`
- `stripe_pk`

3) **Server-only secrets** — keep these only in your serverless host (e.g., Vercel), never in the app/EAS:
- `STRIPE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

⚠️ **Rotate any leaked Stripe keys.** Keys that were ever shared publicly should be regenerated in Stripe, then updated in your host and `.env`.

📦 **Codex environment variables** — add the same values in your Project → Settings → Environment so serverless routes (`/api/*`) get the correct Supabase/Stripe keys without hardcoding them.

4) **Quick wiring check** — after `npm install` + `npm run web` (or `expo start --web`), ensure the console shows no
   "Supabase not configured" warning. Then try:
```ts
const { data, error } = await supabase.from("clients").select("*").limit(1);
console.log({ data, error });
```
Seeing data (or even a permissions error until RLS is set) means keys are loading correctly.

> **Quick start with the included scaffold:**
> 1. From this folder, run `npm install` to pull dependencies.
> 2. Start the dev server with `npm run dev` and open the URL shown (usually http://localhost:5173).
> 3. Edit any component under `src/components` or tune colors in `src/styles/themes.css`.

> **Quick start if you only have this README:**
> 1. Install Node.js (18+). If you don’t have it yet, download from https://nodejs.org and then run `node -v` to confirm.
> 2. In an empty folder, run `npm create vite@latest . -- --template react` to generate the React + Vite app and `npm install`
>    to fetch dependencies.
> 3. Add Tailwind and Supabase using the commands in Step 5 below, then run `npm run dev` to see the site locally.

## Step 5: Project setup (web-first)

### FAQ: "Where's my package.json? How do I run tests?"

If you don't see a `package.json` yet, the project hasn’t been scaffolded. Two options:

1) **Initialize an empty Node project** (placeholder)
   ```bash
   npm init -y
   ```
   This creates a minimal `package.json`; add dependencies as you go (e.g., `npm install react react-dom`).

2) **Scaffold the full Vite + React app right here** (recommended)
   ```bash
   npm create vite@latest . -- --template react
   npm install
   ```
   This generates `package.json`, installs dependencies, and sets up Vite.

Make `npm test` work by adding a lightweight test runner:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Then ensure `package.json` has scripts like:

```jsonc
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest"
}
```

Add a first test (e.g., `src/App.test.tsx`) to verify wiring:

```tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders sanctuary greeting', () => {
  render(<App />);
  expect(screen.getByText(/sanctuary/i)).toBeInTheDocument();
});
```

Run the suite with `npm test`. If you just want a placeholder for now, use:

```jsonc
"scripts": {
  "test": "echo \"(placeholder) no tests yet\" && exit 0"
}
```

1. **Install prerequisites**
   - Node.js ≥ 18 and npm. Confirm with `node -v` and `npm -v`.
2. **Create the app scaffold**
   - `npm create vite@latest lilac-passion -- --template react`
   - `cd lilac-passion`
3. **Add styling stack**
   - `npm install -D tailwindcss postcss autoprefixer`
   - `npx tailwindcss init -p`
   - Update `tailwind.config.js` (starter snippet below):

```ts
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lavender: '#c7b7ff',
        lavender: '#d9d9e3',
        plum: '#2b1238',
        holo: {
          50: '#f7f7ff',
          500: '#bd9bff',
          700: '#7c5ae4',
        },
      },
      borderRadius: { glass: '24px' },
      backdropBlur: { glass: '18px' },
      dropShadow: { glow: '0 10px 25px rgba(189, 155, 255, 0.35)' },
    },
  },
  plugins: [],
};
```

   - Replace `src/index.css` with base styles that include:
     - `@tailwind base; @tailwind components; @tailwind utilities;`
     - CSS variables for light/dark surfaces, e.g., `--panel: rgba(255,255,255,0.16)` and `--panel-dark: rgba(15,23,42,0.35)`.
4. **Add routing and layout shell**
   - `npm install react-router-dom`
   - Create routes: `/login`, `/signup`, `/app` (protected), nested `/app/home`, `/app/map`, `/app/sanctuary`, `/app/profile`.
   - Add a `ProtectedRoute` wrapper that checks auth state and redirects to `/login` when unauthenticated.
5. **Pick auth/backend service: Supabase (recommended for ease)**
   - Create a Supabase project (UI walkthrough at supabase.com — free tier is fine).
   - Enable **Email/Password** auth in Supabase dashboard.
   - Grab the **project URL** and **anon public key**; store in `.env.local`:
     - `VITE_SUPABASE_URL=...`
     - `VITE_SUPABASE_ANON_KEY=...`
   - Example `.env.local` template (do not commit this file):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```
   - Install SDK: `npm install @supabase/supabase-js`
   - Create `src/lib/supabaseClient.ts` that exports a client using env vars.
6. **Set up basic pages**
   - **Login/Signup**: centered glass card; email + password; submit -> Supabase auth.
   - **Home/Sanctuary**: hero gradient, streak chip, today’s mood card, quick links to map and journal.
   - **Map/Collect**: placeholder panel with “collect glow orb” button (stub logic to be wired later).
   - **Settings/Profile**: theme toggle (light/dark), sound toggle, export data button (hooks into Step 6 tables later).
7. **Run locally**
   - `npm install`
   - `npm run dev`
   - Visit the shown localhost port; confirm login flow works end-to-end.
8. **Git hygiene**
   - Add `.env.local` to `.gitignore`.
   - Commit early: scaffold, then Tailwind config, then auth wiring.

## Step 6: Data model (Supabase/Postgres)

Create minimal tables to support mood tracking, map items, and user settings. Run these SQL statements in Supabase SQL editor.

```sql
-- 1) Profiles (user-level settings)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  theme text default 'lilac-light', -- e.g., lilac-light, lilac-dark, lavender, holo
  sound_enabled boolean default true,
  created_at timestamptz default now()
);

-- 2) Mood entries (daily/weekly trends)
create table if not exists moods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  created_at timestamptz default now(),
  mood_value integer not null check (mood_value between 1 and 9),
  moon_phase text not null, -- e.g., "new", "waxing-crescent", ... , "full"
  note text,
  unique (user_id, date_trunc('day', created_at)) -- 1 per day
);

-- 3) Collectibles on the map
create table if not exists collectibles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  kind text not null, -- e.g., glow_orb, badge
  status text default 'available', -- available | collected
  created_at timestamptz default now(),
  collected_at timestamptz
);

-- 4) Check-ins for streaks/rewards
create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  created_at timestamptz default now(),
  reward_granted boolean default false
);
```

### Notes on the mood scale with moon phases
- Use 1–9 mapped to moon phases (1 = new moon/low energy, 9 = full moon/high energy).
- Store both `mood_value` and `moon_phase` text for display; map in UI with icons.

### API helpers (frontend)
- Create a small `src/services/moods.ts` with functions: `logMood(value, moonPhase, note)`, `getMoodHistory(range)`, `exportMoodsCsv()`.
- Create `src/services/collectibles.ts` with `listCollectibles()`, `collectItem(id)`, `getProgress()`.

## Step 8: Security & privacy basics

1. **Environment secrets**
   - Keep Supabase keys in `.env.local`; add to `.gitignore`. In deployment (Vercel/Netlify), set env vars there.
2. **Auth guarding**
   - Wrap all `/app/*` routes with `ProtectedRoute` that checks Supabase session.
3. **Database rules / RLS**
   - In Supabase SQL editor, enable RLS and add policies such as:

```sql
alter table profiles enable row level security;
create policy "Profiles: users can manage their row" on profiles
  for all using (auth.uid() = id);

alter table moods enable row level security;
create policy "Moods: users can manage their moods" on moods
  for all using (auth.uid() = user_id);

alter table collectibles enable row level security;
create policy "Collectibles: users can manage their items" on collectibles
  for all using (auth.uid() = user_id);
```

4. **Backups/exports**
   - Allow users to export mood data as CSV using Supabase `copy` or client-side CSV creation. A simple client helper could be:

```ts
import { supabase } from './lib/supabaseClient';

export async function exportMoodsCsv() {
  const { data, error } = await supabase.from('moods').select('*');
  if (error) throw error;
  const headers = Object.keys(data[0] ?? {});
  const csv = [headers.join(','), ...data.map((row) => headers.map((h) => row[h]).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'moods.csv';
  a.click();
  URL.revokeObjectURL(url);
}
```

5. **Secrets hygiene**
   - Never commit `.env.local`.
   - On deploy, set the same keys in your hosting provider’s dashboard.

With this scaffold you can stay web-only, iterate on the sanctuary aesthetic, and later plug in Supabase for auth/data and
expand toward mobile with Expo.

## Payments + API wiring (Stripe + Vercel)

1. **Local env (.env)**
   - Client-side keys: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `STRIPE_PUBLISHABLE_KEY`, optional `EXPO_PUBLIC_API_BASE_URL` for the deployed API base (e.g., `https://your-vercel-app.vercel.app`).
   - Server-only keys (never expose in Expo/EAS): `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET`.

2. **EAS secrets**
   - Add `supabase_url`, `supabase_anon_key`, `stripe_pk`, and optionally `api_base_url` in **EAS → Project → Secrets**. These map to the `eas.json` entries and feed `app.json` extras.

3. **Serverless endpoints (Vercel)**
   - Deploy with the included `api/create-checkout-session.ts` and `api/stripe-webhook.ts`. Set env vars in Vercel: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
   - After deploy, create a Stripe webhook pointing to `https://<your-vercel-app>/api/stripe-webhook` and use event `checkout.session.completed` (test mode while building).

4. **Supabase DB**
   - Run `supabase/schema.sql` in the Supabase SQL editor to create `clients`, `client_notes`, `inventory`, and `bookings` with permissive RLS for MVP.

5. **Checkout flow in the app**
   - `app/payments/checkout.tsx` calls `startPaymentIntent` which POSTs to `/api/create-checkout-session` (or the `EXPO_PUBLIC_API_BASE_URL` you set). Successful responses redirect the browser to Stripe Checkout; native shows the URL to open while PaymentSheet is not yet wired.
