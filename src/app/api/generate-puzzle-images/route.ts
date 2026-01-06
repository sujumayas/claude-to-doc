import { NextRequest, NextResponse } from 'next/server';
import { getImageGenerationPrompt } from '@/lib/puzzle-system-prompt';
import { PuzzleGenre } from '@/types';

// Force Node.js runtime for Netlify compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface GeneratedImage {
  imageBase64: string;
  caption: string;
}

export async function POST(request: NextRequest) {
  try {
    const { genre, imagePrompts } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    if (!genre || !imagePrompts || !Array.isArray(imagePrompts)) {
      return NextResponse.json(
        { error: 'Missing required fields: genre, imagePrompts' },
        { status: 400 }
      );
    }

    // Generate images for each prompt (limit to 5)
    const promptsToProcess = imagePrompts.slice(0, 5);
    const generatedImages: GeneratedImage[] = [];

    for (const promptText of promptsToProcess) {
      try {
        const fullPrompt = getImageGenerationPrompt(
          genre as PuzzleGenre,
          promptText
        );

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': process.env.GEMINI_API_KEY as string,
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: fullPrompt }],
                },
              ],
              generationConfig: {
                responseModalities: ['TEXT', 'IMAGE'],
              },
            }),
          }
        );

        if (!response.ok) {
          console.error('Gemini API error for prompt:', promptText);
          continue; // Skip this image but continue with others
        }

        const data = await response.json();

        // Extract image from response
        let imageBase64 = null;

        if (data.candidates && data.candidates[0]?.content?.parts) {
          for (const part of data.candidates[0].content.parts) {
            if (part.inlineData?.data) {
              imageBase64 = part.inlineData.data;
              break;
            }
          }
        }

        if (imageBase64) {
          generatedImages.push({
            imageBase64,
            caption: promptText,
          });
        }

        // Add a small delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (imageError) {
        console.error('Error generating image:', imageError);
        continue; // Skip this image but continue with others
      }
    }

    if (generatedImages.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate any images' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      images: generatedImages,
      totalGenerated: generatedImages.length,
      totalRequested: promptsToProcess.length,
    });
  } catch (error) {
    console.error('Puzzle image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate puzzle images' },
      { status: 500 }
    );
  }
}
