'use client';

import { MapType } from '@/types';

interface MapTypeSelectorProps {
  selected: MapType;
  onSelect: (type: MapType) => void;
}

const mapTypes: { value: MapType; label: string; description: string; icon: string }[] = [
  {
    value: 'world',
    label: 'World Map',
    description: 'Regional maps with cities, terrain, and points of interest',
    icon: '🗺️',
  },
  {
    value: 'town',
    label: 'Town Map',
    description: 'Detailed settlement maps with buildings and streets',
    icon: '🏘️',
  },
  {
    value: 'dungeon',
    label: 'Dungeon Map',
    description: 'Gridded battle maps for encounters and exploration',
    icon: '⚔️',
  },
];

export default function MapTypeSelector({ selected, onSelect }: MapTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Map Type
      </label>
      <div className="space-y-2">
        {mapTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onSelect(type.value)}
            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
              selected === type.value
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{type.icon}</span>
              <div>
                <div className="font-medium text-gray-900">{type.label}</div>
                <div className="text-xs text-gray-500">{type.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
