import * as React from "react"
import { AlertCircleIcon, ArrowRightLeftIcon } from "lucide-react"

import { IndexSwapy } from "@/lib/converter.ts"
import { parseInputValues } from "@/lib/parse-input.ts"
import { MARKET_TABS } from "@/lib/pairs.ts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Label } from "@/components/ui/label.tsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx"
import { Textarea } from "@/components/ui/textarea.tsx"

type ResultRow = {
  input: number
  output: number
}

export function ConverterPanel({
  converter,
  marketId,
}: {
  converter: IndexSwapy
  marketId: string
}) {
  const market = MARKET_TABS.find((tab) => tab.id === marketId) ?? MARKET_TABS[0]
  const [prevMarketId, setPrevMarketId] = React.useState(marketId)
  const [pairId, setPairId] = React.useState<string>(market.pairs[0].id)
  const [rawInput, setRawInput] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [rows, setRows] = React.useState<ResultRow[]>([])
  const [busy, setBusy] = React.useState(false)

  if (prevMarketId !== marketId) {
    setPrevMarketId(marketId)
    setPairId(market.pairs[0].id)
    setRows([])
    setError(null)
  }

  const pair = market.pairs.find((item) => item.id === pairId) ?? market.pairs[0]

  async function handleConvert() {
    setBusy(true)
    setError(null)
    try {
      const values = parseInputValues(rawInput)
      if (values.length === 0) {
        throw new Error("Please enter at least one valid number")
      }
      const nextRows: ResultRow[] = []
      for (const value of values) {
        const output = await converter[pair.method](value)
        nextRows.push({ input: value, output })
      }
      setRows(nextRows)
    } catch (err) {
      setRows([])
      setError(err instanceof Error ? err.message : "Conversion failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>
          {pair.from} to {pair.to}
        </CardTitle>
        <CardDescription>
          Paste one or more values. Commas, spaces, dashes, and new lines are fine.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="pair">Conversion</Label>
          <Select value={pairId} onValueChange={setPairId}>
            <SelectTrigger id="pair" className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {market.pairs.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.from} → {item.to}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="values">{pair.from} values</Label>
          <Textarea
            id="values"
            value={rawInput}
            onChange={(event) => setRawInput(event.target.value)}
            placeholder="450, 449, 448"
            className="min-h-28 font-mono"
          />
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Could not convert</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {rows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{pair.from}</TableHead>
                <TableHead>{pair.to}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${row.input}-${row.output}`}>
                  <TableCell className="font-mono">{row.input.toFixed(2)}</TableCell>
                  <TableCell className="font-mono">{row.output.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button type="button" onClick={handleConvert} disabled={busy}>
          <ArrowRightLeftIcon />
          {busy ? "Converting…" : "Convert"}
        </Button>
      </CardFooter>
    </Card>
  )
}
