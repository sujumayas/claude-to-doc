import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getPuzzleSystemPrompt } from '@/lib/puzzle-system-prompt';
import { PuzzleGenre, PuzzleCategory, PuzzleDifficulty } from '@/types';

// Force Node.js runtime for Netlify compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Extend max duration for serverless function
export const maxDuration = 60;

interface PuzzleResponse {
  title: string;
  description: string;
  setupInstructions: string;
  hints: string[];
  solution: string;
  narrativeHooks: string;
  dmNotes: string;
  imagePrompts: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { genre, category, difficulty, prompt } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate inputs
    if (!genre || !category || !difficulty) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: genre, category, difficulty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = getPuzzleSystemPrompt(
      genre as PuzzleGenre,
      category as PuzzleCategory,
      difficulty as PuzzleDifficulty
    );

    const userMessage = prompt?.trim()
      ? `Create a puzzle based on this concept: ${prompt}`
      : `Create an engaging ${difficulty} ${category} puzzle for a ${genre} RPG setting. Be creative and original with the theme and setting.`;

    // Create a streaming response to keep the connection alive
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial keepalive
          controller.enqueue(encoder.encode(''));

          // Use streaming API
          const anthropicStream = anthropic.messages.stream({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 4096,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: userMessage,
              },
            ],
          });

          // Collect the streamed response
          let fullText = '';
          for await (const event of anthropicStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              fullText += event.delta.text;
            }
          }

          // Get final message for usage stats
          const finalMessage = await anthropicStream.finalMessage();

          // Parse the JSON response
          let puzzleData: PuzzleResponse;
          try {
            // Remove any markdown code blocks if present
            const cleanedResponse = fullText
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .trim();
            puzzleData = JSON.parse(cleanedResponse);
          } catch (parseError) {
            console.error('Failed to parse puzzle response:', parseError);
            console.error('Raw response:', fullText);
            const errorResponse = JSON.stringify({
              error: 'Failed to parse puzzle data from AI response'
            });
            controller.enqueue(encoder.encode(errorResponse));
            controller.close();
            return;
          }

          // Generate full markdown content
          const fullMarkdown = generatePuzzleMarkdown(
            puzzleData,
            genre,
            category,
            difficulty
          );

          // Send the final result
          const result = JSON.stringify({
            ...puzzleData,
            fullMarkdown,
            usage: finalMessage.usage,
          });

          controller.enqueue(encoder.encode(result));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorResponse = JSON.stringify({
            error: 'Failed to generate puzzle'
          });
          controller.enqueue(encoder.encode(errorResponse));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Puzzle generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate puzzle' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function generatePuzzleMarkdown(
  puzzle: PuzzleResponse,
  genre: string,
  category: string,
  difficulty: string
): string {
  const genreLabel =
    genre === 'scifi' ? 'Sci-Fi' : genre.charAt(0).toUpperCase() + genre.slice(1);
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return `# ${puzzle.title}

**Genre:** ${genreLabel} | **Type:** ${categoryLabel} Puzzle | **Difficulty:** ${difficultyLabel}

---

## Description

${puzzle.description}

---

## Setup Instructions (DM Only)

${puzzle.setupInstructions}

---

## Progressive Hints

Use these hints in order if players are struggling:

1. **Subtle Hint:** ${puzzle.hints[0] || 'N/A'}
2. **Moderate Hint:** ${puzzle.hints[1] || 'N/A'}
3. **Obvious Hint:** ${puzzle.hints[2] || 'N/A'}
4. **Very Direct Hint:** ${puzzle.hints[3] || 'N/A'}
5. **Near-Solution Hint:** ${puzzle.hints[4] || 'N/A'}

---

## Solution (DM Only)

${puzzle.solution}

---

## Narrative Integration Hooks

${puzzle.narrativeHooks}

---

## DM Notes & Tips

${puzzle.dmNotes}

---

*Generated with RPG Puzzle Generator*
`;
}
