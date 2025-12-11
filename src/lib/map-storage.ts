import { GeneratedMap } from '@/types';

const STORAGE_KEY = 'rpg-generated-maps';

export const saveMapToStorage = (map: GeneratedMap): void => {
  if (typeof window === 'undefined') return;

  const existing = getMapsFromStorage();
  const updated = [map, ...existing].slice(0, 50); // Keep last 50 maps
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getMapsFromStorage = (): GeneratedMap[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const maps = JSON.parse(stored);
    return maps.map((map: GeneratedMap) => ({
      ...map,
      createdAt: new Date(map.createdAt),
    }));
  } catch {
    return [];
  }
};

export const deleteMapFromStorage = (id: string): void => {
  if (typeof window === 'undefined') return;

  const existing = getMapsFromStorage();
  const updated = existing.filter(map => map.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const clearAllMaps = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

export const downloadMap = (map: GeneratedMap): void => {
  const link = document.createElement('a');
  link.href = `data:image/png;base64,${map.imageBase64}`;
  link.download = `${map.mapType}-map-${map.id}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
