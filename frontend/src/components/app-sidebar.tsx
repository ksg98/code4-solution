"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, Search, Database, Scale, Moon, Sun } from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Chat", url: "/dashboard", icon: MessageSquare },
  { title: "Search", url: "/dashboard/search", icon: Search },
  { title: "Sources", url: "/dashboard/sources", icon: Database },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  theme?: string
  toggleTheme?: () => void
}

export function AppSidebar({ theme, toggleTheme, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <SidebarMenuButton size="lg" asChild className="flex-1">
                <Link href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Scale className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">WI Legal AI</span>
                    <span className="truncate text-xs">Law Enforcement</span>
                  </div>
                </Link>
              </SidebarMenuButton>
              <SidebarTrigger className="shrink-0" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {toggleTheme && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={toggleTheme} tooltip="Toggle theme">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>Theme</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <NavUser user={{ name: user?.name || "User", email: user?.email || "", avatar: "" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
