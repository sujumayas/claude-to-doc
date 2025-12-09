# RPG Story Generator

A chat-based application that uses Claude AI to help you create compelling RPG storylines, campaigns, characters, and world-building content.

## Features

- **Chat Interface**: Conversational interaction with Claude AI optimized for RPG content creation
- **Context Upload**: Upload reference documents (.txt, .md, .json, .csv) to provide context for your stories
- **Multi-Format Export**: Export your content in various formats:
  - Text (.txt)
  - Word Document (.docx)
  - PDF (.pdf)
  - CSV (.csv)
- **Iterative Workflow**: Discuss, refine, and iterate on your RPG content

## Deploy to Netlify

### One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/claude-to-doc)

### Manual Deployment

1. Push this repository to GitHub
2. Log in to [Netlify](https://app.netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variable:
   - Go to **Site settings** > **Environment variables**
   - Add `ANTHROPIC_API_KEY` with your API key value
7. Deploy!

## Local Development

### Prerequisites

- Node.js 18+
- An Anthropic API key

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

3. Create a `.env.local` file with your Anthropic API key:
```bash
cp .env.example .env.local
# Edit .env.local and add your API key
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Workflow

1. **Upload Context** (Optional): Add reference documents like world lore, existing character sheets, or campaign notes
2. **Describe Your Needs**: Tell Claude about the RPG content you want to create
3. **Discuss & Refine**: Have a conversation to explore different approaches and ideas
4. **Select Output Format**: Choose your preferred export format (Text, Word, PDF, or CSV)
5. **Generate Final Draft**: Ask Claude to produce the final version
6. **Export & Iterate**: Export your content and continue refining as needed

## Project Structure

```
src/
├── app/
│   ├── api/chat/     # Claude API endpoint
│   ├── layout.tsx    # App layout
│   └── page.tsx      # Main chat page
├── components/
│   ├── ChatInput.tsx     # Message input component
│   ├── ExportPanel.tsx   # Export format selection
│   ├── FileUpload.tsx    # Document upload component
│   └── MessageList.tsx   # Chat message display
├── lib/
│   ├── exporters.ts          # Document export utilities
│   ├── rpg-system-prompt.ts  # RPG-optimized system prompt
│   └── utils.ts              # Helper functions
└── types/
    └── index.ts      # TypeScript type definitions
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes |

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Anthropic SDK** - Claude AI integration
- **docx** - Word document generation
- **jsPDF** - PDF generation
- **file-saver** - File download handling

## License

MIT
