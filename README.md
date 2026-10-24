# IndexSwapy

A small web tool for traders that converts price levels between QQQ, NDX and NQ (Nasdaq) and between SPY and ES (S&P 500) using current ratios.

## Features

- Conversions: QQQ to/from NDX, QQQ to/from NQ, SPY to/from ES
- Paste up to 50 values at once, separated by commas, spaces, dashes or new lines; results shown in a table
- Current NDX/QQQ, NQ/QQQ and ES/SPY ratios shown in the header, fetched from the companion [indexswapy-backend](https://github.com/59n/indexswapy-backend) API and cached for 60 seconds
- Light and dark theme

## Tech stack

- React 19, TypeScript, Vite
- Tailwind CSS 4, shadcn/ui (Radix UI), lucide-react
- Netlify (static hosting with security headers)

## Getting started

Prerequisites: Node.js 22+ (tests use `--experimental-strip-types`).

```bash
npm install
npm run dev
```

When running on `localhost`, the UI requests ratios from `http://127.0.0.1:8888/api/ratios`, so start the backend API on port 8888 first. Elsewhere it uses the deployed backend.

Other scripts:

```bash
npm test          # converter and input parsing tests
npm run lint
npm run typecheck
npm run build     # output in dist/
```

Deploy on Netlify with build command `npm run build` and publish directory `dist` (already set in `netlify.toml`).

## Project structure

```
src/App.tsx                 Layout, ratio badges, theme toggle
src/components/             Converter panel, theme provider/toggle, shadcn/ui components
src/lib/converter.ts        Ratio fetching, caching and conversion math
src/lib/pairs.ts            Supported conversion pairs
src/lib/parse-input.ts      Multi-value input parsing
test/                       Node test script
netlify.toml                Build settings, CSP and security headers
```

## Status

Active. Version 2.0.0, last updated October 2026.

## License

MIT. See [LICENSE](LICENSE). Contribution guidelines are in [CONTRIBUTING.md](CONTRIBUTING.md).
