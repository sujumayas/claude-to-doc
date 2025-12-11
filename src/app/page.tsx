'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, UploadedFile } from '@/types';
import { generateId } from '@/lib/utils';
import { getSystemPromptWithContext } from '@/lib/rpg-system-prompt';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import FileUpload from '@/components/FileUpload';
import ExportPanel from '@/components/ExportPanel';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [outputFormat, setOutputFormat] = useState<'text' | 'docx' | 'pdf' | 'csv'>('text');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const systemPrompt = getSystemPromptWithContext(
        uploadedFiles.map((f) => ({ name: f.name, content: f.content })),
        outputFormat
      );

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please make sure your ANTHROPIC_API_KEY is configured.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Story Generator</h1>
            <p className="text-indigo-200 text-sm">Powered by Claude AI</p>
          </div>
          <button
            onClick={handleClearChat}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-sm transition-colors"
          >
            New Chat
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white shadow-xl overflow-hidden">
        {/* File Upload Section */}
        <FileUpload files={uploadedFiles} onFilesChange={setUploadedFiles} />

        {/* Export Panel */}
        <ExportPanel
          messages={messages}
          outputFormat={outputFormat}
          onFormatChange={setOutputFormat}
        />

        {/* Messages */}
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />

        {/* Chat Input */}
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
