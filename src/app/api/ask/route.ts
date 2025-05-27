import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import axios from 'axios'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    // Optionally limit to last 15 messages for token safety
    const limitedMessages = messages.slice(-15)

    // ✅ Only allow valid models
    const allowedModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']
    const selectedModel = allowedModels.includes(model) ? model : 'gpt-3.5-turbo'

    // 🤖 Ask GPT
    const gptRes = await openai.chat.completions.create({
      model: selectedModel,
      messages: limitedMessages,
    })

    const reply = gptRes.choices[0]?.message?.content?.trim() || ''

    // 🧠 Check if GPT sounds outdated
    const fallbackTriggers = [
      "don't have access to real-time",
      "can't provide real-time",
      "check the latest",
      "after october 2023",
      "do not have browsing capabilities",
      "cannot access current events",
      "currently unavailable",
      "latest news",
      "who won",
      "today",
      "yesterday"
    ]

    const isOutdated = fallbackTriggers.some(trigger =>
      reply.toLowerCase().includes(trigger) ||
      messages[messages.length - 1].content.toLowerCase().includes(trigger) // force fallback for time-based questions
    )

    // 🌐 Use SerpAPI if outdated
    if (isOutdated) {
      console.log('🔁 GPT fallback to SerpAPI for:', messages[messages.length - 1].content)

      // Use the last user message for the SerpAPI query
      const lastUserMsg = [...limitedMessages].reverse().find(m => m.role === "user")?.content || ""
      const serpRes = await axios.get("https://serpapi.com/search", {
        params: {
          q: lastUserMsg,
          api_key: process.env.SERP_API_KEY,
          engine: "google",
        },
      })

      const serpResult =
        serpRes.data.answer_box?.answer ||
        serpRes.data.answer_box?.snippet ||
        serpRes.data.organic_results?.[0]?.snippet ||
        "No real-time results found."

      console.log("📡 SerpAPI Result:", serpResult)

      return NextResponse.json({ reply: serpResult, source: 'serpapi' })
    }

    // ✅ GPT was enough
    return NextResponse.json({ reply, source: 'gpt' })

  } catch (err: any) {
    console.error('❌ API error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
