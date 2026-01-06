import { NextRequest } from 'next/server';
import { getImageGenerationPrompt } from '@/lib/puzzle-system-prompt';
import { PuzzleGenre } from '@/types';

// Force Node.js runtime for Netlify compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Extend max duration for serverless function
export const maxDuration = 60;

interface GeneratedImage {
  imageBase64: string;
  caption: string;
}

export async function POST(request: NextRequest) {
  try {
    const { genre, imagePrompts } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!genre || !imagePrompts || !Array.isArray(imagePrompts)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: genre, imagePrompts' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Limit to 3 images to reduce timeout risk
    const promptsToProcess = imagePrompts.slice(0, 3);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const generatedImages: GeneratedImage[] = [];

        try {
          for (let i = 0; i < promptsToProcess.length; i++) {
            const promptText = promptsToProcess[i];

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
                continue;
              }

              const data = await response.json();

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
            } catch (imageError) {
              console.error('Error generating image:', imageError);
              continue;
            }
          }

          // Return all generated images
          if (generatedImages.length === 0) {
            controller.enqueue(
              encoder.encode(JSON.stringify({ error: 'Failed to generate any images' }))
            );
          } else {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  images: generatedImages,
                  totalGenerated: generatedImages.length,
                  totalRequested: promptsToProcess.length,
                })
              )
            );
          }
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(JSON.stringify({ error: 'Failed to generate puzzle images' }))
          );
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
    console.error('Puzzle image generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate puzzle images' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
