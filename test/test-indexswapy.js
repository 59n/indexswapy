import assert from "node:assert/strict"
import { IndexSwapy } from "../src/lib/converter.ts"
import { MAX_VALUES, parseInputValues } from "../src/lib/parse-input.ts"

function converterWithRatios() {
  const converter = new IndexSwapy()
  converter.ratios = { ndx_qqq: 40, nq_qqq: 41, es_spy: 10 }
  converter.lastUpdated = new Date()
  return converter
}

assert.deepEqual(parseInputValues("450, 449, 448"), [450, 449, 448])
assert.deepEqual(parseInputValues("450 449 448"), [450, 449, 448])
assert.deepEqual(parseInputValues("450-449-448"), [450, 449, 448])
assert.deepEqual(parseInputValues("450, 449 - 448"), [450, 449, 448])
assert.deepEqual(parseInputValues(""), [])

const tooMany = Array.from({ length: MAX_VALUES + 1 }, (_, i) => i + 1).join(", ")
assert.throws(() => parseInputValues(tooMany), /at most/)

const converter = converterWithRatios()
assert.equal(await converter.convertQQQToNDX(400), 16000)
assert.equal(await converter.convertQQQToNQ(400), 16400)
assert.equal(await converter.convertNQToQQQ(4100), 100)
assert.equal(await converter.convertNDXToQQQ(8000), 200)
assert.equal(await converter.convertESToSPY(5000), 500)
assert.equal(await converter.convertSPYToES(500), 5000)

await assert.rejects(() => converter.convertQQQToNDX(-1), /negative/)
await assert.rejects(() => converter.convertQQQToNDX("nope"), /valid number/)
await assert.rejects(() => converter.convertQQQToNDX(2_000_000), /cannot exceed/)
assert.equal(await converter.convertQQQToNDX(400), 16000)

console.log("frontend tests passed")
