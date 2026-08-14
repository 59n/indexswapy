export class IndexSwapy {
  static VERSION = "2.0.0"
  static FETCH_TIMEOUT_MS = 8000
  static MIN_RATIO = 0.5
  static MAX_RATIO = 500

  ratios: {
    ndx_qqq: number | null
    nq_qqq: number | null
    es_spy: number | null
  }
  lastUpdated: Date | null
  lastApiCall: number | null
  rateLimit: number
  maxValue: number
  cacheDuration: number
  resultsCache: Map<string, number>

  constructor() {
    this.ratios = {
      ndx_qqq: null,
      nq_qqq: null,
      es_spy: null,
    }
    this.lastUpdated = null
    this.lastApiCall = null
    this.rateLimit = 1000
    this.maxValue = 1000000
    this.cacheDuration = 60000
    this.resultsCache = new Map()
  }

  static ratiosUrl() {
    if (typeof window !== "undefined") {
      const host = window.location.hostname
      if (host === "localhost" || host === "127.0.0.1") {
        return "http://127.0.0.1:8888/api/ratios"
      }
    }
    return "https://deploy-preview-10--indexswapy-backend.netlify.app/.netlify/functions/indexswapy/api/ratios"
  }

  isValidRatio(value: number) {
    return (
      Number.isFinite(value) &&
      value >= IndexSwapy.MIN_RATIO &&
      value <= IndexSwapy.MAX_RATIO
    )
  }

  async updateRatios() {
    const now = Date.now()
    if (this.lastApiCall && now - this.lastApiCall < this.rateLimit) {
      return true
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), IndexSwapy.FETCH_TIMEOUT_MS)

    try {
      const response = await fetch(IndexSwapy.ratiosUrl(), {
        method: "GET",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      })

      if (!response.ok) {
        throw new Error("Backend request failed")
      }

      const data = (await response.json()) as {
        status?: string
        ratios?: Record<string, number>
      }
      const ratios = data.ratios ?? null
      const ndx = ratios ? Number(ratios["NDX/QQQ Ratio"]) : NaN
      const nq = ratios ? Number(ratios["NQ/QQQ Ratio"]) : NaN
      const es = ratios ? Number(ratios["ES/SPY Ratio"]) : NaN

      if (
        data.status !== "ok" ||
        !this.isValidRatio(ndx) ||
        !this.isValidRatio(nq) ||
        !this.isValidRatio(es)
      ) {
        throw new Error("Invalid response format from backend")
      }

      this.ratios = {
        ndx_qqq: ndx,
        nq_qqq: nq,
        es_spy: es,
      }
      this.lastUpdated = new Date()
      this.lastApiCall = now
      this.resultsCache.clear()
      return true
    } catch {
      if (this.ratios.ndx_qqq && this.ratios.nq_qqq && this.ratios.es_spy) {
        return true
      }
      throw new Error("Failed to fetch ratios from backend. Please try again later.")
    } finally {
      clearTimeout(timeoutId)
    }
  }

  validateInput(value: number | string) {
    const numValue = parseFloat(String(value))
    if (!Number.isFinite(numValue)) {
      throw new Error("Invalid input: Please provide a valid number")
    }
    if (numValue < 0) {
      throw new Error("Invalid input: Value cannot be negative")
    }
    if (numValue > this.maxValue) {
      throw new Error(`Invalid input: Value cannot exceed ${this.maxValue.toLocaleString()}`)
    }
    return numValue
  }

  getCacheKey(method: string, value: number | string) {
    return `${method}:${value}`
  }

  async convertWithCache(method: string, value: number | string) {
    const cacheKey = this.getCacheKey(method, value)
    const cached = this.resultsCache.get(cacheKey)
    if (cached != null) {
      return cached
    }
    const runner = (this as unknown as Record<string, (input: number | string) => Promise<number>>)[method]
    const result = await runner.call(this, value)
    this.resultsCache.set(cacheKey, result)
    return result
  }

  async ensureRatios() {
    if (
      !this.ratios.ndx_qqq ||
      !this.ratios.nq_qqq ||
      !this.ratios.es_spy ||
      !this.lastUpdated ||
      Date.now() - this.lastUpdated.getTime() > this.cacheDuration
    ) {
      await this.updateRatios()
    }
  }

  async convertQQQToNDX(qqqValue: number | string) {
    return this.convertWithCache("_convertQQQToNDX", qqqValue)
  }

  async _convertQQQToNDX(qqqValue: number | string) {
    const numValue = this.validateInput(qqqValue)
    await this.ensureRatios()
    return parseFloat((numValue * (this.ratios.ndx_qqq as number)).toFixed(2))
  }

  async convertQQQToNQ(qqqValue: number | string) {
    return this.convertWithCache("_convertQQQToNQ", qqqValue)
  }

  async _convertQQQToNQ(qqqValue: number | string) {
    const numValue = this.validateInput(qqqValue)
    await this.ensureRatios()
    return parseFloat((numValue * (this.ratios.nq_qqq as number)).toFixed(2))
  }

  async convertNQToQQQ(nqValue: number | string) {
    return this.convertWithCache("_convertNQToQQQ", nqValue)
  }

  async _convertNQToQQQ(nqValue: number | string) {
    const numValue = this.validateInput(nqValue)
    await this.ensureRatios()
    return parseFloat((numValue / (this.ratios.nq_qqq as number)).toFixed(2))
  }

  async convertNDXToQQQ(ndxValue: number | string) {
    return this.convertWithCache("_convertNDXToQQQ", ndxValue)
  }

  async _convertNDXToQQQ(ndxValue: number | string) {
    const numValue = this.validateInput(ndxValue)
    await this.ensureRatios()
    return parseFloat((numValue / (this.ratios.ndx_qqq as number)).toFixed(2))
  }

  async convertESToSPY(esValue: number | string) {
    return this.convertWithCache("_convertESToSPY", esValue)
  }

  async _convertESToSPY(esValue: number | string) {
    const numValue = this.validateInput(esValue)
    await this.ensureRatios()
    return parseFloat((numValue / (this.ratios.es_spy as number)).toFixed(2))
  }

  async convertSPYToES(spyValue: number | string) {
    return this.convertWithCache("_convertSPYToES", spyValue)
  }

  async _convertSPYToES(spyValue: number | string) {
    const numValue = this.validateInput(spyValue)
    await this.ensureRatios()
    return parseFloat((numValue * (this.ratios.es_spy as number)).toFixed(2))
  }
}
