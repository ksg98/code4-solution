"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scale, Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <Scale className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">WI Legal AI</span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
