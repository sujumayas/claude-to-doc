'use client';

import { useRef } from 'react';
import { UploadedFile } from '@/types';
import { generateId, readFileAsText } from '@/lib/utils';

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

export default function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        const content = await readFileAsText(file);
        newFiles.push({
          id: generateId(),
          name: file.name,
          content,
          type: file.type || 'text/plain',
        });
      } catch (error) {
        console.error(`Failed to read file ${file.name}:`, error);
      }
    }

    onFilesChange([...files, ...newFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="border-b bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Context Documents</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-sm px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          + Add Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.md,.json,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {files.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center space-x-2 bg-white border rounded px-3 py-1 text-sm"
            >
              <span className="text-gray-600 truncate max-w-[150px]">{file.name}</span>
              <button
                onClick={() => removeFile(file.id)}
                className="text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          Upload .txt, .md, .json, or .csv files to provide context for your RPG story
        </p>
      )}
    </div>
  );
}
