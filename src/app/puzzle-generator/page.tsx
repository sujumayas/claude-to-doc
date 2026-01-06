'use client';

import { useState, useEffect } from 'react';
import {
  PuzzleGenre,
  PuzzleCategory,
  PuzzleDifficulty,
  GeneratedPuzzle,
  PuzzleImage,
} from '@/types';
import { generateId } from '@/lib/utils';
import {
  savePuzzleToStorage,
  getPuzzlesFromStorage,
  deletePuzzleFromStorage,
  downloadPuzzleMarkdown,
  downloadPuzzleImage,
  downloadAllPuzzleImages,
} from '@/lib/puzzle-storage';
import PuzzleTypeSelector from '@/components/PuzzleTypeSelector';
import PuzzleHistory from '@/components/PuzzleHistory';

export default function PuzzleGeneratorPage() {
  const [selectedGenre, setSelectedGenre] = useState<PuzzleGenre>('fantasy');
  const [selectedCategory, setSelectedCategory] = useState<PuzzleCategory>('logic');
  const [selectedDifficulty, setSelectedDifficulty] = useState<PuzzleDifficulty>('medium');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<'idle' | 'text' | 'images'>('idle');
  const [currentPuzzle, setCurrentPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [savedPuzzles, setSavedPuzzles] = useState<GeneratedPuzzle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('description');

  useEffect(() => {
    setSavedPuzzles(getPuzzlesFromStorage());
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationStep('text');

    try {
      // Step 1: Generate puzzle text with Anthropic
      const textResponse = await fetch('/api/generate-puzzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: selectedGenre,
          category: selectedCategory,
          difficulty: selectedDifficulty,
          prompt: prompt.trim(),
        }),
      });

      const textData = await textResponse.json();

      if (!textResponse.ok) {
        throw new Error(textData.error || 'Failed to generate puzzle');
      }

      // Step 2: Generate images with Gemini
      setGenerationStep('images');
      let images: PuzzleImage[] = [];

      try {
        const imageResponse = await fetch('/api/generate-puzzle-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            genre: selectedGenre,
            imagePrompts: textData.imagePrompts || [],
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          images = (imageData.images || []).map(
            (img: { imageBase64: string; mimeType: string; caption: string }, index: number) => ({
              id: generateId(),
              imageBase64: img.imageBase64,
              mimeType: img.mimeType || 'image/png',
              caption: img.caption,
            })
          );
        }
      } catch (imageError) {
        console.error('Image generation failed:', imageError);
        // Continue without images
      }

      // Create the puzzle object
      const newPuzzle: GeneratedPuzzle = {
        id: generateId(),
        genre: selectedGenre,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        prompt: prompt.trim() || 'Auto-generated puzzle',
        title: textData.title,
        description: textData.description,
        setupInstructions: textData.setupInstructions,
        hints: textData.hints || [],
        solution: textData.solution,
        narrativeHooks: textData.narrativeHooks,
        dmNotes: textData.dmNotes,
        fullMarkdown: textData.fullMarkdown,
        images,
        createdAt: new Date(),
      };

      setCurrentPuzzle(newPuzzle);
      savePuzzleToStorage(newPuzzle);
      setSavedPuzzles(getPuzzlesFromStorage());

      // On mobile, switch to puzzle view after generating
      if (window.innerWidth < 1024) {
        setShowControls(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate puzzle');
    } finally {
      setIsGenerating(false);
      setGenerationStep('idle');
    }
  };

  const handleDelete = (id: string) => {
    deletePuzzleFromStorage(id);
    setSavedPuzzles(getPuzzlesFromStorage());
    if (currentPuzzle?.id === id) {
      setCurrentPuzzle(null);
    }
  };

  const handleSelectPuzzle = (puzzle: GeneratedPuzzle) => {
    setCurrentPuzzle(puzzle);
    if (window.innerWidth < 1024) {
      setShowControls(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const genreLabels: Record<PuzzleGenre, string> = {
    fantasy: 'Fantasy',
    horror: 'Horror',
    scifi: 'Sci-Fi',
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Header */}
      <header className="bg-amber-600 text-white p-3 sm:p-4 shadow-lg">
        <div className="flex items-center justify-between pl-10 lg:pl-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Puzzle Generator</h1>
            <p className="text-amber-200 text-xs sm:text-sm">
              Powered by Claude AI + Gemini Images
            </p>
          </div>
          <button
            onClick={() => setShowControls(!showControls)}
            className="lg:hidden px-3 py-1.5 bg-amber-500 hover:bg-amber-400 rounded-lg text-sm transition-colors"
          >
            {showControls ? 'View Puzzle' : 'Controls'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Controls */}
        <div
          className={`
          ${showControls ? 'flex' : 'hidden'} lg:flex
          w-full lg:w-96 bg-white border-b lg:border-b-0 lg:border-r
          overflow-y-auto p-4 space-y-6 flex-col
          ${!currentPuzzle ? 'flex-1 lg:flex-none' : ''}
        `}
        >
          {/* Puzzle Type Selector */}
          <PuzzleTypeSelector
            selectedGenre={selectedGenre}
            selectedCategory={selectedCategory}
            selectedDifficulty={selectedDifficulty}
            onGenreSelect={setSelectedGenre}
            onCategorySelect={setSelectedCategory}
            onDifficultySelect={setSelectedDifficulty}
          />

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puzzle Concept (Optional)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a specific theme or concept... e.g., 'A puzzle involving an ancient celestial clock that guards access to a forbidden library'"
              className="w-full h-24 sm:h-28 border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank for a randomly themed puzzle
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>
                  {generationStep === 'text'
                    ? 'Generating Puzzle...'
                    : 'Creating Images...'}
                </span>
              </>
            ) : (
              <span>Generate Puzzle</span>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Puzzle History */}
          <PuzzleHistory
            puzzles={savedPuzzles}
            onSelect={handleSelectPuzzle}
            onDelete={handleDelete}
            onDownloadMarkdown={downloadPuzzleMarkdown}
          />
        </div>

        {/* Right Panel - Puzzle Preview */}
        <div
          className={`
          ${showControls ? 'hidden' : 'flex'} lg:flex
          flex-1 bg-gray-100 p-4 sm:p-6 overflow-y-auto flex-col
        `}
        >
          {currentPuzzle ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    {currentPuzzle.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                      {genreLabels[currentPuzzle.genre]}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                      {currentPuzzle.category}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        currentPuzzle.difficulty === 'easy'
                          ? 'bg-green-100 text-green-700'
                          : currentPuzzle.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {currentPuzzle.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadPuzzleMarkdown(currentPuzzle)}
                    className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition-colors"
                  >
                    Download .md
                  </button>
                  {currentPuzzle.images.length > 0 && (
                    <button
                      onClick={() => downloadAllPuzzleImages(currentPuzzle)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Download Images
                    </button>
                  )}
                </div>
              </div>

              {/* Reference Images */}
              {currentPuzzle.images.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Reference Images ({currentPuzzle.images.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currentPuzzle.images.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={`data:${image.mimeType || 'image/png'};base64,${image.imageBase64}`}
                          alt={image.caption}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-lg flex items-center justify-center">
                          <button
                            onClick={() => downloadPuzzleImage(currentPuzzle, index)}
                            className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-white text-gray-800 rounded-lg text-sm transition-opacity"
                          >
                            Download
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {image.caption}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Sections */}
              <div className="space-y-3">
                {/* Description */}
                <CollapsibleSection
                  title="Description"
                  isOpen={expandedSection === 'description'}
                  onToggle={() => toggleSection('description')}
                >
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {currentPuzzle.description}
                  </p>
                </CollapsibleSection>

                {/* Setup Instructions */}
                <CollapsibleSection
                  title="Setup Instructions (DM Only)"
                  isOpen={expandedSection === 'setup'}
                  onToggle={() => toggleSection('setup')}
                  dmOnly
                >
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {currentPuzzle.setupInstructions}
                  </p>
                </CollapsibleSection>

                {/* Progressive Hints */}
                <CollapsibleSection
                  title="Progressive Hints"
                  isOpen={expandedSection === 'hints'}
                  onToggle={() => toggleSection('hints')}
                >
                  <div className="space-y-2">
                    {currentPuzzle.hints.map((hint, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 bg-gray-50 rounded"
                      >
                        <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {index + 1}
                        </span>
                        <p className="text-sm text-gray-700">{hint}</p>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Solution */}
                <CollapsibleSection
                  title="Solution (DM Only)"
                  isOpen={expandedSection === 'solution'}
                  onToggle={() => toggleSection('solution')}
                  dmOnly
                >
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {currentPuzzle.solution}
                  </p>
                </CollapsibleSection>

                {/* Narrative Hooks */}
                <CollapsibleSection
                  title="Narrative Integration Hooks"
                  isOpen={expandedSection === 'narrative'}
                  onToggle={() => toggleSection('narrative')}
                >
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {currentPuzzle.narrativeHooks}
                  </p>
                </CollapsibleSection>

                {/* DM Notes */}
                <CollapsibleSection
                  title="DM Notes & Tips"
                  isOpen={expandedSection === 'notes'}
                  onToggle={() => toggleSection('notes')}
                  dmOnly
                >
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {currentPuzzle.dmNotes}
                  </p>
                </CollapsibleSection>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center flex-1">
              <div className="text-center text-gray-500 px-4">
                <svg
                  className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <h3 className="text-base sm:text-lg font-medium mb-2">
                  No Puzzle Generated Yet
                </h3>
                <p className="text-sm">
                  Select a genre, puzzle type, difficulty, and click Generate
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
  dmOnly = false,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  dmOnly?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-800">{title}</h3>
          {dmOnly && (
            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">
              DM
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
