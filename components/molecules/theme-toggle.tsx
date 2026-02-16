"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch by waiting until mounted
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="w-9 h-9" disabled />
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full transition-all duration-300"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-gray-300 transition-all hover:rotate-45" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-slate-700 transition-all hover:-rotate-45" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}