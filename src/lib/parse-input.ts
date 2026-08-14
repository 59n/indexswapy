export const MAX_VALUES = 50

export function parseInputValues(inputText: string) {
  if (!inputText || !String(inputText).trim()) {
    return []
  }

  const values = String(inputText)
    .split("\n")
    .flatMap((line) => {
      return line.split("-").flatMap((part) => {
        return part
          .trim()
          .split(/[,\s]+/)
          .map((num) => num.trim())
          .filter((num) => num !== "")
          .map((num) => {
            const cleanNum = num.replace(/[^\d.-]/g, "")
            return parseFloat(cleanNum)
          })
      })
    })
    .filter((num) => Number.isFinite(num))

  if (values.length > MAX_VALUES) {
    throw new Error(`Please enter at most ${MAX_VALUES} values at a time`)
  }

  return values
}
