import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildSystemPrompt, buildUserMessage } from '@/lib/prompts'
import type { TranslationRequest, TranslationResponse } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MODEL: Record<string, string> = {
  plain: 'gpt-4o-mini',
  markdown: 'gpt-4o',
}

export async function POST(req: NextRequest): Promise<NextResponse<TranslationResponse>> {
  try {
    const body: TranslationRequest = await req.json()
    const { text, from, to, mode } = body

    if (!text || !text.trim()) {
      return NextResponse.json({ output: '', error: 'Empty input' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: MODEL[mode] ?? 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt(mode) },
        { role: 'user', content: buildUserMessage(text, from, to) },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    })

    const output = completion.choices[0]?.message?.content ?? ''
    return NextResponse.json({ output })
  } catch (err) {
    console.error('[translate]', err)
    return NextResponse.json(
      { output: '', error: 'Translation failed. Please try again.' },
      { status: 500 }
    )
  }
}
