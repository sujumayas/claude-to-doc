'use client';

import { useState } from 'react';

interface LocationInputProps {
  locations: string[];
  onChange: (locations: string[]) => void;
}

export default function LocationInput({ locations, onChange }: LocationInputProps) {
  const [newLocation, setNewLocation] = useState('');

  const addLocation = () => {
    if (newLocation.trim() && locations.length < 20) {
      onChange([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const removeLocation = (index: number) => {
    onChange(locations.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLocation();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Key Locations ({locations.length}/20)
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Add important places that should appear on your map
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Dragon's Peak"
          className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={addLocation}
          disabled={!newLocation.trim() || locations.length >= 20}
          className="px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          Add
        </button>
      </div>

      {locations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {locations.map((loc, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-gray-100 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm"
            >
              <span className="text-emerald-600 font-medium">{index + 1}.</span>
              <span className="text-gray-700 truncate max-w-[120px] sm:max-w-none">{loc}</span>
              <button
                onClick={() => removeLocation(index)}
                className="text-gray-400 hover:text-red-500 ml-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
