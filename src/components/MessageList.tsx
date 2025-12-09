'use client';

import { Message } from '@/types';
import { formatDate } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <h2 className="text-xl font-semibold mb-2">Welcome to RPG Story Generator</h2>
          <p className="text-sm">Start by uploading context documents or describe your RPG campaign idea.</p>
          <div className="mt-4 text-left max-w-md mx-auto bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">Suggested workflow:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Upload any reference docs (optional)</li>
              <li>Describe your RPG setting and needs</li>
              <li>Discuss and refine with Claude</li>
              <li>Request final output in your preferred format</li>
              <li>Export and iterate as needed</li>
            </ol>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-4 ${
              message.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            <div
              className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
              }`}
            >
              {formatDate(new Date(message.timestamp))}
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
