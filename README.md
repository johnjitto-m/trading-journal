# John's Trading Journal

Professional browser-based trading journal for HTF FVG → CISD → LTF execution tracking.

## v20

- Weekly Journal now keeps same-day trades in saved order: first saved trade stays above, newly saved trades appear below it.
- Editing a trade does not change its row order.
- Added `#` column to Weekly Journal and Research Journal so trades are easy to read as 1, 2, 3, 4.
- Preserves `createdAt` and `updatedAt` timestamps for stable order and edit tracking.
- Keeps v19 features: day-month-year dates, Research sort dropdown, `Next Candle Mitigation`, clean dashboard, Add Trade modal, View Trade modal, Delete modal, Supabase cloud sync, and simple Trade Status tracking.


## Version 21

Elegant UI polish: refined dashboard spacing, equal stat cards, cleaner table rows, consistent buttons/badges, premium modal surfaces, and improved mobile responsiveness.


## PWA mobile install

This version includes PWA support. After deploying to GitHub Pages, open the site on Android Chrome/Brave and choose **Install app** or **Add to Home screen**. The installed app uses the same Supabase cloud sync.

Files added:

- `manifest.json`
- `service-worker.js`
- `assets/icons/`
