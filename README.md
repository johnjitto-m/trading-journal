# John's Trading Journal — HTF + LTF FVG Strategy Journal

A lightweight static trading journal built with HTML, CSS and JavaScript.

This version is focused on John's FVG strategy research flow:

1. Basic trade info
2. HTF FVG analysis
3. LTF execution analysis

## What is included

### Basic Info

- Date
- Auto day
- Pair
- Direction
- Session
- HTF timeframe
- Auto LTF timeframe

Auto LTF map:

- 15m HTF → 1m LTF
- 1H HTF → 5m LTF
- 4H HTF → 15m LTF
- 1D HTF → 1H LTF

### HTF Analysis

- Multiple HTF TradingView / image links
- HTF preview box
- First FVG / Second FVG
- Clean / Messy / Irregular CISD
- FVG inside CISD / FVG outside CISD
- FVG mitigation / retracement / entry behavior multi-select
- HTF notes

### LTF Analysis

- Multiple LTF TradingView / image links
- LTF preview box
- Entry level multi-select
- BE logic select one

The earlier LTF entry behavior question was merged into the HTF mitigation/retracement question. LTF notes are intentionally removed.

## TradingView snapshot preview

Use TradingView camera/snapshot link format:

```text
https://www.tradingview.com/x/yourSnapshotId/
```

Normal live chart/layout links may open in TradingView but may not preview inside the app.

## Reference example images

Replace files in:

```text
assets/examples/
```

Current example files:

```text
clean-cisd.svg
messy-cisd.svg
irregular-cisd.svg
fvg-inside-cisd.svg
fvg-outside-cisd.svg
```

You can replace them with PNG files, but then update the paths in `app.js`.

## Data storage

Trades are saved in your browser's localStorage. Use `Backup JSON` regularly.

## Deploy to GitHub Pages

Push the files to your `trading-journal` repo and enable GitHub Pages from the `main` branch, `/root` folder.


## v8 updates

- Adds LTF trade outcome: BE / SL / TP.
- Adds Risk $ and RR back into the LTF outcome card.
- Shows all saved HTF and LTF chart links in the trade log using your custom link labels.
- Reference example paths now point to `.png` files in `assets/examples/`.
