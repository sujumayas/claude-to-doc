'use client';

import { PuzzleGenre, PuzzleCategory, PuzzleDifficulty } from '@/types';

interface PuzzleTypeSelectorProps {
  selectedGenre: PuzzleGenre;
  selectedCategory: PuzzleCategory;
  selectedDifficulty: PuzzleDifficulty;
  onGenreSelect: (genre: PuzzleGenre) => void;
  onCategorySelect: (category: PuzzleCategory) => void;
  onDifficultySelect: (difficulty: PuzzleDifficulty) => void;
}

const genres: { value: PuzzleGenre; label: string; icon: string }[] = [
  { value: 'fantasy', label: 'Fantasy', icon: '🏰' },
  { value: 'horror', label: 'Horror', icon: '👻' },
  { value: 'scifi', label: 'Sci-Fi', icon: '🚀' },
];

const categories: { value: PuzzleCategory; label: string; description: string }[] = [
  { value: 'logic', label: 'Logic', description: 'Deductive reasoning' },
  { value: 'pattern', label: 'Pattern', description: 'Visual sequences' },
  { value: 'riddle', label: 'Riddle', description: 'Wordplay challenge' },
  { value: 'sequence', label: 'Sequence', description: 'Correct ordering' },
  { value: 'environmental', label: 'Environmental', description: 'Spatial puzzles' },
  { value: 'cipher', label: 'Cipher', description: 'Code breaking' },
  { value: 'mechanism', label: 'Mechanism', description: 'Physical devices' },
];

const difficulties: { value: PuzzleDifficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'hard', label: 'Hard', color: 'red' },
];

export default function PuzzleTypeSelector({
  selectedGenre,
  selectedCategory,
  selectedDifficulty,
  onGenreSelect,
  onCategorySelect,
  onDifficultySelect,
}: PuzzleTypeSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Genre Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Genre
        </label>
        <div className="flex gap-2">
          {genres.map((genre) => (
            <button
              key={genre.value}
              onClick={() => onGenreSelect(genre.value)}
              className={`flex-1 p-2 sm:p-3 rounded-lg border-2 transition-all ${
                selectedGenre === genre.value
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <span className="text-xl sm:text-2xl block">{genre.icon}</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900">{genre.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Puzzle Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategorySelect(cat.value)}
              className={`p-2 rounded-lg border-2 text-left transition-all ${
                selectedCategory === cat.value
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="font-medium text-gray-900 text-xs sm:text-sm">{cat.label}</div>
              <div className="text-xs text-gray-500 hidden sm:block">{cat.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Difficulty
        </label>
        <div className="flex gap-2">
          {difficulties.map((diff) => {
            const colorClasses = {
              green: selectedDifficulty === diff.value
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-green-300 bg-white text-gray-700',
              yellow: selectedDifficulty === diff.value
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-200 hover:border-yellow-300 bg-white text-gray-700',
              red: selectedDifficulty === diff.value
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-red-300 bg-white text-gray-700',
            };

            return (
              <button
                key={diff.value}
                onClick={() => onDifficultySelect(diff.value)}
                className={`flex-1 p-2 sm:p-3 rounded-lg border-2 font-medium text-sm transition-all ${
                  colorClasses[diff.color as keyof typeof colorClasses]
                }`}
              >
                {diff.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
