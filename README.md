# John's Trading Journal WebApp v15

Professional HTF FVG + LTF execution trading journal with Supabase cloud sync.

## v15 changes

- Clean trade log columns: Date, Pair, Direction, Setup, CISD, Result, Actions.
- Added View Trade details modal.
- View modal shows full Basic Info, HTF Analysis, LTF Analysis, outcome, P/L, and chart links.
- Kept modern delete confirmation modal.
- Improved Research Journal analytics:
  - Winning trade similarities
  - Losing trade similarities
  - Best/worst CISD type
  - Best FVG order
  - Best FVG location
  - Best/worst mitigation tag
  - Best entry level
  - Best BE logic
- Added more research filters:
  - Direction
  - FVG location
  - Mitigation/retracement tag
  - Entry level
  - BE logic

## Supabase setup

Open `app.js` and set:

```js
const SUPABASE_PROJECT_ID = 'your-project-id';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_...';
```

Never paste service_role keys, secret keys, or database passwords in the frontend.
