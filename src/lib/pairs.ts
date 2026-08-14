export const MARKET_TABS = [
  {
    id: "nasdaq",
    label: "Nasdaq",
    pairs: [
      { id: "qqq_ndx", from: "QQQ", to: "NDX", method: "convertQQQToNDX" },
      { id: "ndx_qqq", from: "NDX", to: "QQQ", method: "convertNDXToQQQ" },
      { id: "qqq_nq", from: "QQQ", to: "NQ", method: "convertQQQToNQ" },
      { id: "nq_qqq", from: "NQ", to: "QQQ", method: "convertNQToQQQ" },
    ],
  },
  {
    id: "spx",
    label: "S&P 500",
    pairs: [
      { id: "spy_es", from: "SPY", to: "ES", method: "convertSPYToES" },
      { id: "es_spy", from: "ES", to: "SPY", method: "convertESToSPY" },
    ],
  },
] as const

export type ConversionMethod =
  (typeof MARKET_TABS)[number]["pairs"][number]["method"]
