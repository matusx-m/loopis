// src/app/page.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Sparkles, Loader2, Globe } from "lucide-react"
import { ModelSelector } from "@/components/ModelSelector"

export default function Home() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: string; content: string; source?: string }[]>([])
  const [model, setModel] = useState("4o-mini")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    const newMessages = [...messages, { role: "user", content: input }]
    setMessages(newMessages)
    setInput("")

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, model })
      })

      const data = await res.json()
      if (Array.isArray(data.messages)) {
        setMessages((prev) => [
          ...prev,
          ...data.messages.map((msg: { reply: string; source?: string }) => ({
            role: "assistant",
            content: msg.reply,
            source: msg.source,
          })),
        ])
      } else if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, source: data.source },
        ])
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] text-[#f5f5f7] flex flex-col">
      <header className="border-b border-[#1f1f1f] bg-[#0a0a0a]/95 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#0071e3]" />
            <h1 className="text-xl font-semibold text-[#f5f5f7]">Loopie Chat</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-6 mb-6 scrollbar-thin scrollbar-thumb-[#2d2d2f] scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-4 animate-fade-in ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8 border border-[#2d2d2f] shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-[#0071e3] to-[#00a1ff] text-white">
                    {msg.source === "serpapi" ? (
                      <Globe className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-full rounded-2xl px-4 py-2.5 shadow-lg transition-all duration-200 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-[#0071e3] to-[#00a1ff] text-white"
                    : msg.source === "serpapi"
                      ? "bg-[#181f2a] text-[#f5f5f7] border border-[#0071e3] relative ring-2 ring-[#00a1ff]/40 ring-offset-2"
                      : "bg-[#1a1a1a] text-[#f5f5f7] border border-[#2d2d2f] hover:border-[#0071e3]"
                }`}
              >
                {msg.source === "serpapi" && (
                  <div className="flex flex-col items-start mb-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#0071e3] via-[#00a1ff] to-[#00e3ff] text-white shadow animate-pulse">
                      <Globe className="h-3.5 w-3.5 mr-1" />
                      Live Search
                    </span>
                    <div className="w-full border-b border-[#0071e3]/30 mt-1 mb-1" />
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <Avatar className="h-8 w-8 border border-[#2d2d2f] shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-[#0071e3] to-[#00a1ff] text-white">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4 animate-fade-in">
              <Avatar className="h-8 w-8 border border-[#2d2d2f] shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-[#0071e3] to-[#00a1ff] text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-[#1a1a1a] text-[#f5f5f7] border border-[#2d2d2f] rounded-2xl px-4 py-2.5 shadow-lg">
                <Loader2 className="h-5 w-5 animate-spin text-[#0071e3]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center mb-6 text-center">
            <div className="bg-[#1a1a1a] border border-[#2d2d2f] rounded-2xl p-6 shadow-lg max-w-md w-full">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-[#0071e3] animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#0071e3] to-[#00a1ff] bg-clip-text text-transparent">
                Welcome to Loopie Chat
              </h2>
              <p className="text-[#86868b] text-sm">
                Start a conversation with our AI assistant. Ask anything, and I'll help you with a thoughtful response.
              </p>
            </div>
          </div>
        )}

        {/* Model Selector Dropdown */}
        <div className="flex items-center justify-center mb-4">
          <ModelSelector value={model} onChange={setModel} />
        </div>

        <div className="relative">
          <Input
            placeholder="Message Loopie Chat..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pr-12 py-3 rounded-2xl border-[#2d2d2f] bg-[#1a1a1a] text-[#f5f5f7] placeholder:text-[#86868b] focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-all duration-200 hover:border-[#0071e3]"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-br from-[#0071e3] to-[#00a1ff] hover:from-[#0077ed] hover:to-[#00a8ff] text-white rounded-xl p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </main>
  )
}
