"use client"

import { LoginForm } from "@/components/login-form"
import { useTheme } from "@/hooks/use-theme"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export default function Page() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 h-9 w-9"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
