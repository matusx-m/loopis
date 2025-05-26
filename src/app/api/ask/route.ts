import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

// Input validation schema
const requestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  model: z.string().optional(),
})

// Type for the validated request
type ChatRequest = z.infer<typeof requestSchema>

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Maximum message length to prevent abuse
const MAX_MESSAGE_LENGTH = 4000

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate request body
    const result = requestSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request format', details: result.error.format() },
        { status: 400 }
      )
    }

    const { message, model } = result.data

    // Additional validation
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long. Maximum length is ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      )
    }

    const chat = await openai.chat.completions.create({
      model: model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      temperature: 0.7, // Add some creativity but not too much
      max_tokens: 1000, // Prevent extremely long responses
    })

    if (!chat.choices[0]?.message?.content) {
      throw new Error('No response from OpenAI')
    }

    return NextResponse.json({ 
      reply: chat.choices[0].message.content,
      model: chat.model,
      usage: chat.usage
    })
  } catch (err: any) {
    console.error('API error:', err)
    
    // Handle specific OpenAI errors
    if (err instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: err.message, type: err.type },
        { status: err.status || 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
