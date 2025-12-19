import { Scale } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto py-6 md:py-8">
        <div className="flex flex-col gap-4">
          {/* Top row - Logo and copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Scale className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">
                WI Legal AI
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CodeFour AI. All rights reserved.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Disclaimer:</strong> This tool provides legal information, not legal advice.
              Always consult your department&apos;s legal counsel for specific situations.
              Information may not reflect the most recent legal developments.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
