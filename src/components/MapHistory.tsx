'use client';

import { GeneratedMap } from '@/types';

interface MapHistoryProps {
  maps: GeneratedMap[];
  onSelect: (map: GeneratedMap) => void;
  onDelete: (id: string) => void;
  onDownload: (map: GeneratedMap) => void;
}

export default function MapHistory({ maps, onSelect, onDelete, onDownload }: MapHistoryProps) {
  if (maps.length === 0) {
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
        Map History ({maps.length})
      </h3>
      <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
        {maps.map((map) => (
          <div
            key={map.id}
            className="bg-gray-50 rounded-lg p-2 sm:p-3 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <img
                src={`data:image/png;base64,${map.imageBase64}`}
                alt="Map thumbnail"
                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded cursor-pointer flex-shrink-0"
                onClick={() => onSelect(map)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-emerald-600 uppercase">
                    {map.mapType}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(map.createdAt)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 truncate mt-1">
                  {map.prompt}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() => onSelect(map)}
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onDownload(map)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => onDelete(map.id)}
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
