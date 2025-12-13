import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime for Netlify compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { prompt, mapType, locations } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Build the enhanced prompt based on map type
    const styleGuide = getStyleGuide(mapType);
    const locationsList = locations.length > 0
      ? `\n\nIMPORTANT LOCATIONS TO INCLUDE (place these logically on the map):\n${locations.map((loc: string, i: number) => `${i + 1}. ${loc}`).join('\n')}`
      : '';

    const fullPrompt = `${styleGuide}\n\nMap Description: ${prompt}${locationsList}\n\nCreate a detailed, high-quality RPG map image. Ensure all specified locations are clearly visible and logically positioned. The map should be suitable for tabletop roleplaying games.`;

    // Call Gemini API with the correct image generation model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: fullPrompt }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate map', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract image from response
    let imageBase64 = null;
    let textResponse = '';

    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          imageBase64 = part.inlineData.data;
        }
        if (part.text) {
          textResponse = part.text;
        }
      }
    }

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image generated', textResponse },
        { status: 500 }
      );
    }

    // Generate legend based on locations
    const legend = locations.map((loc: string, i: number) => ({
      number: i + 1,
      name: loc,
    }));

    return NextResponse.json({
      image: imageBase64,
      legend,
      description: textResponse,
    });
  } catch (error) {
    console.error('Map generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate map' },
      { status: 500 }
    );
  }
}

function getStyleGuide(mapType: string): string {
  switch (mapType) {
    case 'world':
      return `Create a vintage-style fantasy world/region map with the following characteristics:
- Parchment/aged paper background texture
- Hand-drawn aesthetic with artistic flourishes
- Include terrain features: mountains, forests, rivers, coastlines, seas
- Use classic map icons for cities (castle icons), towns (building icons), ports (anchor icons), battle sites (crossed swords), treasure locations (chest icons)
- Include decorative elements like a compass rose, sea monsters, or border decorations
- Place names in elegant fantasy typography
- Color palette: sepia, muted blues for water, greens for forests, browns for mountains`;

    case 'town':
      return `Create a detailed medieval town/settlement map with the following characteristics:
- Bird's eye view / isometric perspective
- Show individual buildings with distinct purposes (taverns, shops, temples, houses)
- Include defensive walls, gates, and watchtowers if fortified
- Show streets, paths, and a central market square
- Include surrounding terrain (farms, forests, water features)
- Number key locations for a legend
- Style: detailed hand-drawn illustration, colored with muted natural tones
- Include features like: wells, stables, docks if near water, farmland`;

    case 'dungeon':
      return `Create a detailed dungeon/interior battle map with the following characteristics:
- Top-down view with a square grid overlay for tabletop gaming
- Show rooms connected by corridors and passages
- Include both constructed areas (stone rooms with doors) and natural caves
- Add environmental features: water pools, pillars, stairs, furniture, crates
- Use a darker color palette: grays, browns, with occasional color accents
- Include secret passages or hidden areas
- Doors should be clearly marked (regular and special doors with different colors)
- Style: clean lines suitable for virtual tabletop use`;

    default:
      return 'Create a detailed fantasy RPG map suitable for tabletop gaming.';
  }
}
