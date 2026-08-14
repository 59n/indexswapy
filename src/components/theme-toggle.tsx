import { MoonIcon, SunIcon } from "lucide-react"

import { useTheme } from "@/components/theme-provider.tsx"
import { Button } from "@/components/ui/button.tsx"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const nextTheme = theme === "dark" ? "light" : "dark"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={`Switch to ${nextTheme} mode`}
      onClick={() => setTheme(nextTheme)}
    >
      <SunIcon className="size-4 dark:hidden" />
      <MoonIcon className="hidden size-4 dark:block" />
    </Button>
  )
}
