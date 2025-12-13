'use client';

import { useState, useEffect } from 'react';
import { MapType, GeneratedMap } from '@/types';
import { generateId } from '@/lib/utils';
import { saveMapToStorage, getMapsFromStorage, deleteMapFromStorage, downloadMap } from '@/lib/map-storage';
import MapTypeSelector from '@/components/MapTypeSelector';
import LocationInput from '@/components/LocationInput';
import MapHistory from '@/components/MapHistory';

export default function MapGeneratorPage() {
  const [selectedType, setSelectedType] = useState<MapType>('world');
  const [prompt, setPrompt] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMap, setCurrentMap] = useState<GeneratedMap | null>(null);
  const [savedMaps, setSavedMaps] = useState<GeneratedMap[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    setSavedMaps(getMapsFromStorage());
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a map description');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapType: selectedType,
          prompt: prompt.trim(),
          locations: locations.filter(l => l.trim()),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate map');
      }

      const newMap: GeneratedMap = {
        id: generateId(),
        mapType: selectedType,
        prompt: prompt.trim(),
        locations: locations.filter(l => l.trim()),
        imageBase64: data.image,
        legend: data.legend,
        description: data.description,
        createdAt: new Date(),
      };

      setCurrentMap(newMap);
      saveMapToStorage(newMap);
      setSavedMaps(getMapsFromStorage());
      // On mobile, switch to map view after generating
      if (window.innerWidth < 1024) {
        setShowControls(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate map');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteMapFromStorage(id);
    setSavedMaps(getMapsFromStorage());
    if (currentMap?.id === id) {
      setCurrentMap(null);
    }
  };

  const handleSelectMap = (map: GeneratedMap) => {
    setCurrentMap(map);
    // On mobile, switch to map view when selecting a map
    if (window.innerWidth < 1024) {
      setShowControls(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Header */}
      <header className="bg-emerald-600 text-white p-3 sm:p-4 shadow-lg">
        <div className="flex items-center justify-between pl-10 lg:pl-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Map Generator</h1>
            <p className="text-emerald-200 text-xs sm:text-sm">Powered by Gemini AI</p>
          </div>
          {/* Mobile toggle button */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="lg:hidden px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-sm transition-colors"
          >
            {showControls ? 'View Map' : 'Controls'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Controls */}
        <div className={`
          ${showControls ? 'flex' : 'hidden'} lg:flex
          w-full lg:w-96 bg-white border-b lg:border-b-0 lg:border-r
          overflow-y-auto p-4 space-y-6 flex-col
          ${!currentMap ? 'flex-1 lg:flex-none' : ''}
        `}>
          {/* Map Type Selector */}
          <MapTypeSelector selected={selectedType} onSelect={setSelectedType} />

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Map Description
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your map in detail... e.g., 'A coastal kingdom with a major port city, surrounded by mountains to the north and forests to the east'"
              className="w-full h-28 sm:h-32 border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Locations Input */}
          <LocationInput locations={locations} onChange={setLocations} />

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Generating Map...</span>
              </>
            ) : (
              <span>Generate Map</span>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Map History */}
          <MapHistory
            maps={savedMaps}
            onSelect={handleSelectMap}
            onDelete={handleDelete}
            onDownload={downloadMap}
          />
        </div>

        {/* Right Panel - Map Preview */}
        <div className={`
          ${showControls ? 'hidden' : 'flex'} lg:flex
          flex-1 bg-gray-100 p-4 sm:p-6 overflow-y-auto flex-col
        `}>
          {currentMap ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  {currentMap.mapType.charAt(0).toUpperCase() + currentMap.mapType.slice(1)} Map
                </h2>
                <button
                  onClick={() => downloadMap(currentMap)}
                  className="px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                >
                  Download PNG
                </button>
              </div>

              {/* Map Image */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src={`data:image/png;base64,${currentMap.imageBase64}`}
                  alt="Generated Map"
                  className="w-full h-auto"
                />
              </div>

              {/* Legend */}
              {currentMap.legend.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Map Legend</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentMap.legend.map((item) => (
                      <div key={item.number} className="flex items-center space-x-2 text-sm">
                        <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-medium flex-shrink-0">
                          {item.number}
                        </span>
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {currentMap.description && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-gray-800 mb-2">AI Description</h3>
                  <p className="text-sm text-gray-600">{currentMap.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center flex-1">
              <div className="text-center text-gray-500 px-4">
                <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <h3 className="text-base sm:text-lg font-medium mb-2">No Map Generated Yet</h3>
                <p className="text-sm">Select a map type, describe your map, and click Generate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
