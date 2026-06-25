# John's Trading Journal — v9 Supabase Cloud Sync

A browser-based trading journal for John's HTF FVG → CISD → LTF execution model.

## What v9 adds

- Supabase email/password login
- Cloud save/load for trades
- Same trades across laptop, mobile, and tablet after login
- Local browser backup still works
- Backup JSON and Export CSV still work

## Supabase setup

Create a Supabase project and run this in **SQL Editor → New query**:

```sql
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  trade_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trades enable row level security;

create policy "Users can read own trades"
on public.trades
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own trades"
on public.trades
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own trades"
on public.trades
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own trades"
on public.trades
for delete
to authenticated
using (auth.uid() = user_id);
```

## Add your Supabase keys

Open `app.js` and replace:

```js
const SUPABASE_PROJECT_ID = 'PASTE_YOUR_PROJECT_ID_HERE';
const SUPABASE_PUBLISHABLE_KEY = 'PASTE_YOUR_PUBLISHABLE_KEY_HERE';
```

Use only:

- Project ID / Reference
- Publishable key / anon public key

Never paste service role key, secret key, or database password into frontend code.

## Push to GitHub

```bash
cd ~/Downloads/trading-journal
cp -r ~/Downloads/trading-journal-webapp-v9/* .
git status
git add .
git commit -m "Add Supabase cloud sync"
git push origin main
```

Then wait for GitHub Pages deployment.

## First use

1. Open the live GitHub Pages website.
2. Sign up with email/password.
3. If email confirmation is enabled in Supabase, confirm your email.
4. Sign in.
5. Add a trade.
6. Open the site from mobile and sign in with the same account.

If you already have local trades, click **Upload Local to Cloud** after signing in.

## Important

Use TradingView snapshot links where possible. Uploaded fallback screenshots are stored inside the trade object and can make cloud rows heavy if the image is large.


## v10 Auth Gate

The app now shows only the Supabase sign-in/sign-up screen until the user signs in. After sign-in, the journal opens and the cloud header only shows the signed-in email/status and Logout.


## Version 11 update

- Login screen now shows only sign in / sign up.
- After login, the journal page shows a compact Supabase session header with signed-in email and logout only.
- Manual Load Cloud / Upload Local controls were removed from the UI.
- Trades auto-save to Supabase when you save/edit/delete.
- JSON import auto-syncs to Supabase when signed in.
