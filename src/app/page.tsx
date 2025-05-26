// src/app/page.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Sparkles, Loader2, Zap, Brain } from "lucide-react"

export default function Home() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [model, setModel] = useState("gpt-3.5-turbo")
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
        body: JSON.stringify({ message: input, model })
      })

      const data = await res.json()
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
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

  const toggleModel = () => {
    setModel(model === "gpt-3.5-turbo" ? "gpt-4" : "gpt-3.5-turbo")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] text-[#f5f5f7] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1f1f1f] bg-[#0a0a0a]/95 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#0071e3]" />
            <h1 className="text-xl font-semibold text-[#f5f5f7]">Loopie Chat</h1>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-6 mb-6 scrollbar-thin scrollbar-thumb-[#2d2d2f] scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#86868b] gap-4">
              <Sparkles className="h-12 w-12 text-[#0071e3] animate-pulse" />
              <p className="text-center text-lg">Welcome to Loopie Chat</p>
              <p className="text-center text-sm text-[#86868b]">Start a conversation with our AI assistant</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-4 animate-fade-in ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <Avatar className="h-8 w-8 border border-[#2d2d2f] shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-[#0071e3] to-[#00a1ff] text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-lg transition-all duration-200 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-[#0071e3] to-[#00a1ff] text-white"
                      : "bg-[#1a1a1a] text-[#f5f5f7] border border-[#2d2d2f] hover:border-[#0071e3]"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <Avatar className="h-8 w-8 border border-[#2d2d2f] shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-[#0071e3] to-[#00a1ff] text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
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

        {/* Model Switch */}
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={toggleModel}
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2d2d2f] hover:border-[#0071e3] transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              {model === "gpt-3.5-turbo" ? (
                <>
                  <Zap className="h-4 w-4 text-[#0071e3]" />
                  <span className="text-sm font-medium">GPT-3.5 Turbo</span>
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 text-[#0071e3]" />
                  <span className="text-sm font-medium">GPT-4</span>
                </>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0071e3]/10 to-[#00a1ff]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        </div>

        {/* Input Area */}
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
