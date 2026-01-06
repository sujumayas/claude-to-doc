import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime for Netlify compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_ANTHROPIC_MODEL = 'claude-3-5-sonnet-latest';
const anthropicModel = process.env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL;

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const response = await anthropic.messages.create({
      model: anthropicModel,
      max_tokens: 8192,
      system: systemPrompt,
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    return NextResponse.json({
      message: assistantMessage,
      usage: response.usage
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
