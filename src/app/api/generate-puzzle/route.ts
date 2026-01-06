import Anthropic, { APIError } from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { getPuzzleSystemPrompt } from '@/lib/puzzle-system-prompt';
import { PuzzleGenre, PuzzleCategory, PuzzleDifficulty } from '@/types';

// Force Node.js runtime for Netlify compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const anthropicModel =
  process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

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
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Validate inputs
    if (!genre || !category || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: genre, category, difficulty' },
        { status: 400 }
      );
    }

    const systemPrompt = getPuzzleSystemPrompt(
      genre as PuzzleGenre,
      category as PuzzleCategory,
      difficulty as PuzzleDifficulty
    );

    const userMessage = prompt?.trim()
      ? `Create a puzzle based on this concept: ${prompt}`
      : `Create an engaging ${difficulty} ${category} puzzle for a ${genre} RPG setting. Be creative and original with the theme and setting.`;

    let assistantMessage = '';
    let responseUsage;

    try {
      const response = await anthropic.messages.create({
        model: anthropicModel,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      const textContent = response.content.find(
        (content): content is { type: 'text'; text: string } =>
          content.type === 'text'
      );

      if (!textContent) {
        return NextResponse.json(
          { error: 'Invalid response format from puzzle generator' },
          { status: 502 }
        );
      }

      assistantMessage = textContent.text;
      responseUsage = response.usage;
    } catch (apiError) {
      console.error('Anthropic API error during puzzle generation:', apiError);

      if (apiError instanceof APIError) {
        return NextResponse.json(
          { error: apiError.message },
          { status: apiError.status || 500 }
        );
      }

      return NextResponse.json(
        { error: 'Unexpected error contacting puzzle generation service' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let puzzleData: PuzzleResponse;
    try {
      // Remove any markdown code blocks if present
      const cleanedResponse = assistantMessage
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      puzzleData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse puzzle response:', parseError);
      console.error('Raw response:', assistantMessage);
      return NextResponse.json(
        { error: 'Failed to parse puzzle data from AI response' },
        { status: 500 }
      );
    }

    // Generate full markdown content
    const fullMarkdown = generatePuzzleMarkdown(
      puzzleData,
      genre,
      category,
      difficulty
    );

    return NextResponse.json({
      ...puzzleData,
      fullMarkdown,
      usage: responseUsage,
    });
  } catch (error) {
    console.error('Puzzle generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate puzzle' },
      { status: 500 }
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
