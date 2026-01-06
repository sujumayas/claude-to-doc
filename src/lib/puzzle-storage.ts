import { GeneratedPuzzle } from '@/types';

const STORAGE_KEY = 'rpg-generated-puzzles';

export const savePuzzleToStorage = (puzzle: GeneratedPuzzle): void => {
  if (typeof window === 'undefined') return;

  const existing = getPuzzlesFromStorage();
  const updated = [puzzle, ...existing].slice(0, 30); // Keep last 30 puzzles
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getPuzzlesFromStorage = (): GeneratedPuzzle[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const puzzles = JSON.parse(stored);
    return puzzles.map((puzzle: GeneratedPuzzle) => ({
      ...puzzle,
      createdAt: new Date(puzzle.createdAt),
    }));
  } catch {
    return [];
  }
};

export const deletePuzzleFromStorage = (id: string): void => {
  if (typeof window === 'undefined') return;

  const existing = getPuzzlesFromStorage();
  const updated = existing.filter(puzzle => puzzle.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const clearAllPuzzles = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

export const downloadPuzzleMarkdown = (puzzle: GeneratedPuzzle): void => {
  const blob = new Blob([puzzle.fullMarkdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${puzzle.genre}-${puzzle.category}-puzzle-${puzzle.id}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadPuzzleImage = (puzzle: GeneratedPuzzle, imageIndex: number): void => {
  const image = puzzle.images[imageIndex];
  if (!image) return;

  const link = document.createElement('a');
  link.href = `data:image/png;base64,${image.imageBase64}`;
  link.download = `${puzzle.genre}-puzzle-${puzzle.id}-image-${imageIndex + 1}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadAllPuzzleImages = (puzzle: GeneratedPuzzle): void => {
  puzzle.images.forEach((_, index) => {
    setTimeout(() => downloadPuzzleImage(puzzle, index), index * 200);
  });
};
