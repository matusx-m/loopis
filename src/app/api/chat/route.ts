import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    })

    return NextResponse.json({ reply: chat.choices[0].message.content })
  } catch (err) {
    if (err instanceof Error) {
      console.error('🧠 OpenAI ERROR:', err.message)
      return NextResponse.json(
        { error: err.message || 'Something went wrong' },
        { status: 500 }
      )
    }

    console.error('🧠 Unknown ERROR:', err)
    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
