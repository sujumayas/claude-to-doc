# RPG Toolkit

A comprehensive AI-powered toolkit for RPG game masters and storytellers. Create compelling storylines with Claude AI and generate custom maps with Gemini AI.

## Features

### Story Generator (Claude AI)
- **Chat Interface**: Conversational interaction optimized for RPG content creation
- **Context Upload**: Upload reference documents (.txt, .md, .json, .csv) to provide context
- **Multi-Format Export**: Export content as Text, Word (.docx), PDF, or CSV
- **Iterative Workflow**: Discuss, refine, and iterate on your RPG content

### Map Generator (Gemini AI)
- **Three Map Types**:
  - **World Maps**: Regional maps with cities, terrain, and points of interest
  - **Town Maps**: Detailed settlement maps with buildings and streets
  - **Dungeon Maps**: Gridded battle maps for encounters and exploration
- **Custom Locations**: Add specific locations that will be placed logically on the map
- **Auto-Generated Legends**: Numbered legends based on your specified locations
- **Map History**: Generated maps are saved to localStorage for easy access
- **Download**: Export maps as PNG files

## Deploy to Netlify

### Manual Deployment

1. Push this repository to GitHub
2. Log in to [Netlify](https://app.netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables:
   - Go to **Site settings** > **Environment variables**
   - Add `ANTHROPIC_API_KEY` with your Anthropic API key
   - Add `GEMINI_API_KEY` with your Google Gemini API key
7. Deploy!

## Local Development

### Prerequisites

- Node.js 20+
- An Anthropic API key (for Story Generator)
- A Google Gemini API key (for Map Generator)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd claude-to-doc
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your API keys:
```bash
cp .env.example .env.local
# Edit .env.local and add your API keys
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Story Generator
1. Navigate to **Story Chat** in the sidebar
2. Upload context documents (optional)
3. Describe your RPG content needs
4. Discuss and refine with Claude
5. Select output format and export

### Map Generator
1. Navigate to **Map Generator** in the sidebar
2. Select a map type (World, Town, or Dungeon)
3. Describe your map in detail
4. Add key locations that should appear on the map
5. Click **Generate Map**
6. Download or view from history

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/           # Claude API endpoint
│   │   └── generate-map/   # Gemini API endpoint
│   ├── map-generator/      # Map generator page
│   ├── layout.tsx          # App layout with sidebar
│   └── page.tsx            # Story chat page
├── components/
│   ├── ChatInput.tsx       # Message input
│   ├── ExportPanel.tsx     # Export format selection
│   ├── FileUpload.tsx      # Document upload
│   ├── LocationInput.tsx   # Map location input
│   ├── MapHistory.tsx      # Saved maps display
│   ├── MapTypeSelector.tsx # Map type selection
│   ├── MessageList.tsx     # Chat messages
│   └── Sidebar.tsx         # Navigation sidebar
├── lib/
│   ├── exporters.ts        # Document export utilities
│   ├── map-storage.ts      # LocalStorage for maps
│   ├── rpg-system-prompt.ts # Story system prompt
│   └── utils.ts            # Helper functions
└── types/
    └── index.ts            # TypeScript definitions
```

## Environment Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `ANTHROPIC_API_KEY` | Anthropic API key | Story Generator |
| `GEMINI_API_KEY` | Google Gemini API key | Map Generator |

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Anthropic SDK** - Claude AI integration
- **Google Gemini API** - Map image generation
- **docx** - Word document generation
- **jsPDF** - PDF generation
- **file-saver** - File download handling

## License

MIT
