'use client';

import { GeneratedPuzzle } from '@/types';

interface PuzzleHistoryProps {
  puzzles: GeneratedPuzzle[];
  onSelect: (puzzle: GeneratedPuzzle) => void;
  onDelete: (id: string) => void;
  onDownloadMarkdown: (puzzle: GeneratedPuzzle) => void;
}

const genreIcons: Record<string, string> = {
  fantasy: '🏰',
  horror: '👻',
  scifi: '🚀',
};

const difficultyColors: Record<string, string> = {
  easy: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  hard: 'text-red-600 bg-red-50',
};

export default function PuzzleHistory({
  puzzles,
  onSelect,
  onDelete,
  onDownloadMarkdown,
}: PuzzleHistoryProps) {
  if (puzzles.length === 0) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Puzzle History ({puzzles.length})
      </h3>
      <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
        {puzzles.map((puzzle) => (
          <div
            key={puzzle.id}
            className="bg-gray-50 rounded-lg p-2 sm:p-3 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => onSelect(puzzle)}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-amber-100 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                {genreIcons[puzzle.genre] || '🧩'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-amber-600 uppercase">
                    {puzzle.category}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(puzzle.createdAt)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate mt-1">
                  {puzzle.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      difficultyColors[puzzle.difficulty] || 'text-gray-600 bg-gray-100'
                    }`}
                  >
                    {puzzle.difficulty}
                  </span>
                  {puzzle.images.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {puzzle.images.length} images
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(puzzle);
                    }}
                    className="text-xs text-amber-600 hover:underline"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadMarkdown(puzzle);
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Download .md
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(puzzle.id);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
