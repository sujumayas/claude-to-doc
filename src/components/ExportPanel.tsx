'use client';

import { useState } from 'react';
import { Message } from '@/types';
import { exportContent } from '@/lib/exporters';

interface ExportPanelProps {
  messages: Message[];
  outputFormat: 'text' | 'docx' | 'pdf' | 'csv';
  onFormatChange: (format: 'text' | 'docx' | 'pdf' | 'csv') => void;
}

export default function ExportPanel({ messages, outputFormat, onFormatChange }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportMode, setExportMode] = useState<'last' | 'all'>('last');

  const handleExport = async () => {
    if (messages.length === 0) return;

    setIsExporting(true);
    try {
      let content: string;

      if (exportMode === 'last') {
        // Export only the last assistant message
        const lastAssistantMessage = [...messages]
          .reverse()
          .find(m => m.role === 'assistant');
        content = lastAssistantMessage?.content || '';
      } else {
        // Export full conversation
        content = messages
          .map(m => `[${m.role.toUpperCase()}]\n${m.content}`)
          .join('\n\n---\n\n');
      }

      if (!content) {
        alert('No content to export');
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `rpg-story-${timestamp}`;

      await exportContent(content, filename, outputFormat);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formats: Array<{ value: 'text' | 'docx' | 'pdf' | 'csv'; label: string }> = [
    { value: 'text', label: 'Text' },
    { value: 'docx', label: 'Word' },
    { value: 'pdf', label: 'PDF' },
    { value: 'csv', label: 'CSV' },
  ];

  return (
    <div className="border-b bg-white p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Output Format:</span>
          <div className="flex space-x-1">
            {formats.map((format) => (
              <button
                key={format.value}
                onClick={() => onFormatChange(format.value)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  outputFormat === format.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {format.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={exportMode}
            onChange={(e) => setExportMode(e.target.value as 'last' | 'all')}
            className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="last">Last Response</option>
            <option value="all">Full Conversation</option>
          </select>

          <button
            onClick={handleExport}
            disabled={isExporting || messages.length === 0}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
