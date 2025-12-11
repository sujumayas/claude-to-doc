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

// Map Generator Types
export type MapType = 'world' | 'town' | 'dungeon';

export interface MapLocation {
  id: string;
  name: string;
}

export interface GeneratedMap {
  id: string;
  mapType: MapType;
  prompt: string;
  locations: string[];
  imageBase64: string;
  legend: { number: number; name: string }[];
  description?: string;
  createdAt: Date;
}

export interface MapGeneratorState {
  selectedType: MapType;
  prompt: string;
  locations: string[];
  isGenerating: boolean;
  generatedMaps: GeneratedMap[];
}
