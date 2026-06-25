# John's Trading Journal — v12 Dashboard + Research View

A professional FVG strategy research journal with Supabase cloud sync.

## v12 changes

- Homepage/Dashboard now shows **current week trades only**.
- Homepage stats are weekly stats:
  - This Week P/L
  - This Week Win Rate
  - This Week Trades
  - This Week Avg RR
- Removed search and dropdown filters from the homepage.
- Added **View All Trades / Research Journal** button.
- Added a separate **Trade Research** view for all trade data.
- Research view includes:
  - All trades
  - Search
  - Pair filter
  - Result filter
  - Session filter
  - HTF filter
  - FVG order filter
  - CISD type filter
  - Date range filter
  - Filtered stats
  - Filtered strategy edge snapshot
- Supabase cloud sync stays active.
- Backup JSON and Export CSV still work.

## Supabase setup

Open `app.js` and paste your Supabase values:

```js
const SUPABASE_PROJECT_ID = 'your-project-id';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_...';
```

Do not paste service role keys, secret keys, or database passwords.

## Push to GitHub

```bash
cd ~/Downloads/trading-journal

git status
git add .
git commit -m "Add dashboard and research journal views"
git push origin main
```

After GitHub Pages deploys, hard refresh the site with `Ctrl + Shift + R`.


## v13 fixes

- Delete now removes the trade from Supabase before removing it locally.
- Edit now starts from Basic Info, so date, pair, direction, session, HTF/LTF, HTF data, LTF data, and outcome can all be changed.
