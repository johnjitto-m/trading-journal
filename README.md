# John's Trading Journal — v14

A cloud-synced HTF/LTF FVG strategy research journal.

## Current version

v14 adds a modern delete confirmation modal.

### Included

- Supabase login / sign-up
- Cloud-synced trades
- Dashboard view with current-week trades only
- Research Journal view with all trades and filters
- HTF analysis flow
- LTF execution flow
- Multiple TradingView / image links per trade
- Backup JSON
- Export CSV
- Full trade editing from Basic Info onward
- Delete from Supabase cloud and local journal
- Modern delete confirmation modal with trade summary

## Supabase setup

Open `app.js` and paste your own values:

```js
const SUPABASE_PROJECT_ID = 'your-project-id';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_...';
```

Do not paste database passwords, service role keys, or secret keys.

## Push

```bash
git add .
git commit -m "Add modern delete confirmation modal"
git push origin main
```
