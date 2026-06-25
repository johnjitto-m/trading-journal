# John's Trading Journal WebApp v17

Professional HTF FVG + LTF execution trading journal with Supabase cloud sync.

## v17 changes

- Added simple Trade Status in Step 1:
  - Took Trade
  - Missed Trade
  - Not Taken
- Missed Trade and Not Taken are saved in the journal, but excluded from P/L, win rate, average RR, and strategy analytics.
- Trade logs now include a Status column.
- Research Journal includes a Trade Status filter.
- View Trade details modal shows trade status.
- Export CSV includes Trade Status.
- Kept the clean homepage dashboard and full Research Journal analytics.
- Kept the wider 16:9 Trade Details modal layout.

## Supabase setup

The Supabase Project ID and publishable key are already set in `app.js` for John's project.

Never paste service_role keys, secret keys, or database passwords in the frontend.
