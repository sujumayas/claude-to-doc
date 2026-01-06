import { PuzzleGenre, PuzzleCategory, PuzzleDifficulty } from '@/types';

export const getPuzzleSystemPrompt = (
  genre: PuzzleGenre,
  category: PuzzleCategory,
  difficulty: PuzzleDifficulty
): string => {
  const genreGuide = getGenreGuide(genre);
  const categoryGuide = getCategoryGuide(category);
  const difficultyGuide = getDifficultyGuide(difficulty);

  return `You are an expert RPG puzzle designer specializing in creating engaging, balanced, and genre-appropriate puzzles for tabletop role-playing games.

## YOUR TASK
Create a complete, ready-to-use puzzle for a ${genre.toUpperCase()} RPG setting.

## GENRE CONTEXT
${genreGuide}

## PUZZLE CATEGORY
${categoryGuide}

## DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
${difficultyGuide}

## OUTPUT FORMAT
You MUST respond with a valid JSON object with the following structure:
{
  "title": "A thematic, evocative title for the puzzle",
  "description": "A 2-3 paragraph atmospheric description that the DM can read or paraphrase to players. Include sensory details (sight, sound, smell) and mood-setting elements appropriate to the genre.",
  "setupInstructions": "Clear DM-only instructions for preparing and running this puzzle. Include required props, handouts, or visual aids.",
  "hints": ["First subtle hint", "Second more obvious hint", "Third very direct hint", "Fourth hint that nearly reveals the answer", "Fifth hint that is essentially the solution explained"],
  "solution": "The complete solution explanation, including the logic/reasoning and step-by-step process to solve.",
  "narrativeHooks": "2-3 suggestions for integrating this puzzle into larger campaign narratives, including potential story connections and character tie-ins.",
  "dmNotes": "Tips for running the puzzle smoothly, common player approaches, alternative solutions to accept, and how to handle if players get completely stuck.",
  "imagePrompts": ["Detailed prompt 1 for generating reference image", "Detailed prompt 2", "Detailed prompt 3"]
}

## IMAGE PROMPTS REQUIREMENTS
Generate 3 detailed image prompts that would help visualize key elements of the puzzle. Each prompt should:
- Be 2-3 sentences describing a specific visual scene or object from the puzzle
- Include style direction (e.g., "fantasy illustration style", "dark gothic horror art", "sci-fi concept art")
- Focus on elements players would actually see or interact with
- Include atmosphere, lighting, and mood appropriate to the genre

## DESIGN PRINCIPLES TO FOLLOW
1. **Multiple Solution Paths**: Design at least 2-3 valid approaches to solve the puzzle
2. **Character Integration**: Include ways different character types/skills can contribute
3. **Failure States**: Define what happens on failed attempts (consequences that escalate)
4. **Time Target**: Design for approximately ${difficulty === 'easy' ? '5-10' : difficulty === 'medium' ? '10-15' : '15-25'} minutes of solve time
5. **No Meta-Gaming**: Solutions should be accessible to characters, not require player world knowledge
6. **Thematic Consistency**: Every element must fit the ${genre} genre aesthetically and narratively

RESPOND ONLY WITH THE JSON OBJECT. No additional text before or after.`;
};

const getGenreGuide = (genre: PuzzleGenre): string => {
  const guides: Record<PuzzleGenre, string> = {
    fantasy: `**FANTASY RPG (D&D, Pathfinder Style)**
- Use magical elements: runes, elemental forces, enchantments, divine/arcane energy
- Ancient civilizations, lost knowledge, mystical creatures
- Consider: pressure plates, magical seals, elemental alignment, runic sequences
- Aesthetic: torchlit dungeons, weathered stone, glowing crystals, arcane symbols
- Common themes: balance of elements, ancestral wisdom, divine trials, nature spirits`,

    horror: `**HORROR RPG (Call of Cthulhu, Dread Style)**
- Emphasize psychological tension, dread, and the unknown
- Forbidden knowledge, sanity-testing revelations, time pressure
- Include: investigation elements, cryptic clues, disturbing imagery, moral dilemmas
- Aesthetic: dim lighting, decay, unsettling symbols, things not quite right
- Common themes: cosmic horror, hidden truths, corruption, sacrifice, isolation
- Note: Solving the puzzle should feel like uncovering something that perhaps should stay hidden`,

    scifi: `**SCI-FI RPG (Starfinder, Traveller Style)**
- Technology-based challenges: hacking, power systems, alien interfaces
- Scientific reasoning, probability, system manipulation
- Include: circuit paths, energy routing, holographic displays, quantum states
- Aesthetic: sleek interfaces, damaged tech, alien geometries, bioluminescence
- Common themes: AI logic, alien communication, failing systems, lost colony mysteries
- Consider: What logical system would an advanced civilization use?`,
  };
  return guides[genre];
};

const getCategoryGuide = (category: PuzzleCategory): string => {
  const guides: Record<PuzzleCategory, string> = {
    logic: `**LOGIC PUZZLE**
Design a puzzle requiring deductive reasoning:
- Grid-based deduction (Sudoku-style, but themed)
- Process of elimination with clues
- Truth/lie paradoxes with NPCs or texts
- Relationship mapping (alliances, hierarchies)
- Conditional statements ("If X then Y")
Include clear logical rules and enough information to solve definitively.`,

    pattern: `**PATTERN RECOGNITION PUZZLE**
Design a puzzle requiring players to identify patterns:
- Visual sequences (symbols, colors, shapes)
- Numerical progressions (possibly in-world number systems)
- Elemental or thematic cycles
- Musical/auditory patterns
- Spatial arrangements
The pattern should be discoverable through observation and have a satisfying "aha!" moment.`,

    riddle: `**RIDDLE PUZZLE**
Design a wordplay-based challenge:
- The riddle should have a clear, logical answer
- Multiple interpretations can exist but one is clearly intended
- Include context clues in the environment
- Consider: who wrote this riddle and why?
- The answer should relate to something in the puzzle's immediate environment
Provide the complete riddle text and ensure it's solvable without external knowledge.`,

    sequence: `**SEQUENCE PUZZLE**
Design a puzzle requiring correct ordering:
- Activation sequences (levers, buttons, pedestals)
- Timing-based elements
- Multi-step processes with dependencies
- Ritual steps or procedural requirements
Include visual or textual clues about the correct order scattered appropriately.`,

    environmental: `**ENVIRONMENTAL/SPATIAL PUZZLE**
Design a puzzle using the physical space:
- Pressure plates requiring specific positions
- Light/shadow manipulation
- Object placement on designated spots
- Line-of-sight or path-blocking challenges
- Gravity or physics-based mechanics
Consider how different party compositions might approach this spatially.`,

    cipher: `**CIPHER/CODE PUZZLE**
Design an encryption-based challenge:
- Substitution ciphers with in-world keys
- Symbol-to-letter mapping with provided legend
- Multi-layered decryption (progressive revelation)
- Number codes using in-world references
Include the encoded message and provide sufficient context clues to decode it.
Note: The cipher method should be discoverable, not arbitrarily complex.`,

    mechanism: `**MECHANISM PUZZLE**
Design a physical/mechanical contraption:
- Lock mechanisms with multiple components
- Gear or lever interactions
- Power routing and circuit completion
- Moving parts that must align
- Combination locks with themed clues
Describe the mechanism clearly so the DM can convey how it responds to player actions.`,
  };
  return guides[category];
};

const getDifficultyGuide = (difficulty: PuzzleDifficulty): string => {
  const guides: Record<PuzzleDifficulty, string> = {
    easy: `**EASY DIFFICULTY**
- Single-step or simple two-step solution
- Clear, obvious clues readily visible
- Direct cause-and-effect relationships
- Minimal misdirection
- Low consequences for trial-and-error (minor setbacks)
- Ideal for: introducing puzzle mechanics, younger groups, time-limited sessions
- Failure state: temporary setback, minor resource cost`,

    medium: `**MEDIUM DIFFICULTY**
- Multi-step solution (2-4 steps)
- Clues require some interpretation or combination
- Some misdirection or red herrings present
- Requires team discussion and multiple perspectives
- Moderate consequences for failure (damage, alerts, resource loss)
- Failure state: escalating danger, time pressure activation
- Balance challenge with accessibility`,

    hard: `**HARD DIFFICULTY**
- Complex, layered solution (4+ steps or parallel paths)
- Clues are subtle and require careful observation
- Significant misdirection; false solutions exist
- May require specific character knowledge/abilities
- Time pressure or environmental hazards present
- High failure consequences (serious damage, permanent changes, alerting enemies)
- Failure state: major setback, potential party split, resource depletion
- Design multiple valid solutions of varying elegance`,
  };
  return guides[difficulty];
};

export const getImageGenerationPrompt = (
  genre: PuzzleGenre,
  imageDescription: string
): string => {
  const styleGuides: Record<PuzzleGenre, string> = {
    fantasy: 'fantasy RPG illustration style, medieval fantasy aesthetic, magical atmosphere, warm torchlight and cool magical glows, detailed textures, painterly quality',
    horror: 'dark horror illustration style, unsettling atmosphere, muted colors with stark contrasts, shadows and fog, decay and age, psychological dread, gothic elements',
    scifi: 'science fiction concept art style, futuristic technology, holographic elements, sleek metallic surfaces, neon accents, alien geometries, high-tech interfaces',
  };

  return `${imageDescription}. ${styleGuides[genre]}. High quality, detailed illustration suitable for RPG reference material. No text or words in the image.`;
};
