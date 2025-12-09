export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UploadedFile {
  id: string;
  name: string;
  content: string;
  type: string;
}

export interface ConversationContext {
  systemPrompt: string;
  uploadedFiles: UploadedFile[];
  outputFormat: 'text' | 'docx' | 'pdf' | 'csv';
}

export interface ChatState {
  messages: Message[];
  context: ConversationContext;
  isLoading: boolean;
}

export interface ExportOptions {
  format: 'text' | 'docx' | 'pdf' | 'csv';
  content: string;
  filename: string;
}
