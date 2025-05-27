"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Check, ChevronDown, Sparkles, Star, Flame, Sun, Globe, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const modelGroups = [
  {
    group: "OpenAI",
    models: [
      {
        value: "4o-mini",
        label: "4o-mini",
        description: "Perfect for most tasks and talks like ChatGPT.",
        icon: <Sparkles className="h-5 w-5 text-[#fff]" />,
        badge: "Best",
        tooltip: "OpenAI's most balanced model for everyday use.",
      },
      {
        value: "4o",
        label: "4o",
        description: "Handles complex topics, excels at visual understanding.",
        icon: <Star className="h-5 w-5 text-[#fff]" />,
        tooltip: "Great for advanced reasoning and image input.",
      },
    ],
  },
  {
    group: "Anthropic",
    models: [
      {
        value: "3.5-haiku",
        label: "3.5 Haiku",
        description: "Perfect for most tasks and talks like Claude.",
        icon: <Sun className="h-5 w-5 text-orange-400" />,
        tooltip: "Anthropic's fast, cost-effective model.",
      },
      {
        value: "4.0-sonnet",
        label: "4.0 Sonnet",
        description: "High performance matched with creativity of Claude.",
        icon: <Flame className="h-5 w-5 text-pink-500" />,
        badge: "New",
        tooltip: "Anthropic's latest and most creative model.",
      },
    ],
  },
  {
    group: "Google",
    models: [
      {
        value: "2.0-flash",
        label: "2.0 Flash",
        description: "Google's most reliable and efficient model.",
        icon: <Globe className="h-5 w-5 text-blue-400" />,
        badge: "Fast",
        tooltip: "Google's fastest and most efficient model.",
      },
    ],
  },
]

export function ModelSelector({
  value,
  onChange,
  loading = false,
  asyncOptions,
}: {
  value: string
  onChange: (value: string) => void
  loading?: boolean
  asyncOptions?: () => Promise<typeof modelGroups>
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [groups, setGroups] = React.useState(modelGroups)
  const [isLoading, setIsLoading] = React.useState(false)
  const [highlighted, setHighlighted] = React.useState<string | null>(null)
  const popoverRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Async loading support
  React.useEffect(() => {
    if (asyncOptions && open) {
      setIsLoading(true)
      asyncOptions().then((data) => {
        setGroups(data)
        setIsLoading(false)
      })
    } else {
      setGroups(modelGroups)
    }
  }, [open, asyncOptions])

  // Filtered and grouped models
  const filteredGroups = groups
    .map(group => ({
      ...group,
      models: group.models.filter(model =>
        model.label.toLowerCase().includes(search.toLowerCase()) ||
        model.description.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(group => group.models.length > 0)

  const allFilteredModels = filteredGroups.flatMap(g => g.models)
  const selected = allFilteredModels.find((m) => m.value === value) ?? allFilteredModels[0]

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) setHighlighted(null)
  }, [open, search])

  React.useEffect(() => {
    if (open && allFilteredModels.length > 0 && highlighted === null) {
      setHighlighted(allFilteredModels[0].value)
    }
  }, [open, search])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    const idx = allFilteredModels.findIndex(m => m.value === highlighted)
    if (e.key === "ArrowDown") {
      e.preventDefault()
      const next = allFilteredModels[(idx + 1) % allFilteredModels.length]
      setHighlighted(next.value)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const prev = allFilteredModels[(idx - 1 + allFilteredModels.length) % allFilteredModels.length]
      setHighlighted(prev.value)
    } else if (e.key === "Enter" && highlighted) {
      e.preventDefault()
      onChange(highlighted)
      setOpen(false)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full max-w-xs justify-between bg-[#1a1a1a] border border-[#2d2d2f] px-4 py-2 rounded-xl text-[#f5f5f7] shadow hover:border-[#0071e3] transition"
          disabled={loading}
        >
          <span className="flex items-center gap-2">
            {selected?.icon}
            {selected?.label}
          </span>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-2" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 border-none bg-[#18181b] shadow-xl rounded-xl"
        ref={popoverRef}
        onKeyDown={handleKeyDown}
      >
        <div className="p-3 border-b border-[#23232b]">
          <Input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search models..."
            className="bg-[#23232b] border-none text-[#f5f5f7] placeholder:text-[#86868b] rounded-lg"
            autoFocus
            disabled={isLoading}
          />
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#0071e3]" />
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center text-[#86868b] py-8">No models found.</div>
          ) : (
            filteredGroups.map(group => (
              <div key={group.group}>
                <div className="px-4 py-2 text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                  {group.group}
                </div>
                {group.models.map(model => (
                  <TooltipProvider key={model.value} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            onChange(model.value)
                            setOpen(false)
                          }}
                          onMouseEnter={() => setHighlighted(model.value)}
                          className={cn(
                            "flex items-start gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors",
                            value === model.value
                              ? "bg-[#23232b] text-[#f5f5f7]"
                              : highlighted === model.value
                                ? "bg-[#23232b]/80 text-[#f5f5f7]"
                                : "hover:bg-[#23232b] text-[#86868b]"
                          )}
                          tabIndex={-1}
                        >
                          <div className="pt-1">{model.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{model.label}</span>
                              {model.badge && (
                                <span className={cn(
                                  "ml-2 text-xs rounded px-2 py-0.5",
                                  model.badge === "New" && "bg-pink-600 text-white",
                                  model.badge === "Best" && "bg-green-600 text-white",
                                  model.badge === "Fast" && "bg-blue-600 text-white"
                                )}>{model.badge}</span>
                              )}
                            </div>
                            <div className="text-xs">{model.description}</div>
                          </div>
                          {value === model.value && (
                            <Check className="h-5 w-5 text-[#0071e3] ml-2" />
                          )}
                        </button>
                      </TooltipTrigger>
                      {model.tooltip && (
                        <TooltipContent side="right" className="max-w-xs text-xs">
                          {model.tooltip}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
} 