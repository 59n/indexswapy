import * as React from "react"
import { ArrowLeftRightIcon } from "lucide-react"

import { ConverterPanel } from "@/components/converter-panel.tsx"
import { ThemeToggle } from "@/components/theme-toggle.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import { Separator } from "@/components/ui/separator.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx"
import { IndexSwapy } from "@/lib/converter.ts"
import { MARKET_TABS } from "@/lib/pairs.ts"

function formatRatio(value: number | null) {
  if (value == null) return "—"
  return value.toFixed(4)
}

export function App() {
  const converter = React.useMemo(() => new IndexSwapy(), [])
  const [market, setMarket] = React.useState<string>(MARKET_TABS[0].id)
  const [updatedAt, setUpdatedAt] = React.useState<Date | null>(null)
  const [ratioError, setRatioError] = React.useState<string | null>(null)
  const [, setTick] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    converter
      .updateRatios()
      .then(() => {
        if (cancelled) return
        setUpdatedAt(converter.lastUpdated)
        setRatioError(null)
        setTick((value) => value + 1)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setRatioError(error instanceof Error ? error.message : "Ratios unavailable")
      })
    return () => {
      cancelled = true
    }
  }, [converter])

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 items-center justify-center rounded-lg border bg-card">
              <ArrowLeftRightIcon className="size-4" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-medium tracking-tight">
                IndexSwapy
              </h1>
              <p className="text-sm text-muted-foreground">
                Convert QQQ, NDX, NQ, SPY, and ES with live ratios.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">NDX/QQQ {formatRatio(converter.ratios.ndx_qqq)}</Badge>
            <Badge variant="outline">NQ/QQQ {formatRatio(converter.ratios.nq_qqq)}</Badge>
            <Badge variant="outline">ES/SPY {formatRatio(converter.ratios.es_spy)}</Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
        {ratioError ? (
          <p className="text-sm text-destructive">{ratioError}</p>
        ) : null}
        <Tabs value={market} onValueChange={setMarket}>
          <TabsList>
            {MARKET_TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {MARKET_TABS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <ConverterPanel converter={converter} marketId={tab.id} />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            IndexSwapy v{IndexSwapy.VERSION}
            {updatedAt ? ` · Ratios ${updatedAt.toLocaleString()}` : ""}
          </div>
          <div className="flex items-center gap-3">
            <a
              className="hover:text-foreground"
              href="https://github.com/59n/indexswapy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Frontend
            </a>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <a
              className="hover:text-foreground"
              href="https://github.com/59n/indexswapy-backend"
              target="_blank"
              rel="noopener noreferrer"
            >
              Backend
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
