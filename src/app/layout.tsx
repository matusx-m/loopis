"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sparkles, MessageSquare, History, Globe, Settings, Menu } from "lucide-react"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import "../app/layout-metadata" // Ensures metadata is used from the right place

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const navigation = [
  { name: "Chat", href: "/", icon: MessageSquare },
  { name: "History", href: "/history", icon: History },
  { name: "Spaces", href: "/spaces", icon: Globe },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] text-[#f5f5f7]">
          {/* Mobile Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed top-4 left-4 z-50 lg:hidden bg-[#1a1a1a] p-2 rounded-lg border border-[#2d2d2f] hover:border-[#0071e3]"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Sidebar */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-40 w-64 bg-[#0a0a0a]/95 backdrop-blur-md border-r border-[#1f1f1f]",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full",
              "lg:translate-x-0"
            )}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-[#1f1f1f]">
                <Sparkles className="h-5 w-5 text-[#0071e3]" />
                <h1 className="text-xl font-semibold">Loopie Chat</h1>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navigation.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-2 text-sm font-medium",
                      item.href === "/" // change this for active route later
                        ? "bg-[#1a1a1a] text-[#0071e3]"
                        : "text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#1a1a1a]"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Button>
                ))}
              </nav>
              <div className="p-4 border-t border-[#1f1f1f]">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2 text-sm font-medium text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#1a1a1a]"
                >
                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#0071e3] to-[#00a1ff]" />
                  <span>Profile</span>
                </Button>
              </div>
            </div>
          </aside>

          <main
            className={cn(
              "min-h-screen transition-all duration-300 ease-in-out",
              isSidebarOpen ? "lg:pl-64" : "lg:pl-0"
            )}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
