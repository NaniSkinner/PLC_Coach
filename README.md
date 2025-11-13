# AI PLC Virtual Coach

An AI-powered virtual coach for Professional Learning Communities (PLCs), built with Next.js, OpenAI GPT-4o, and Pinecone vector database. This application provides framework-grounded coaching based on Solution Tree's PLC at Work® methodology.

## Features

- **Framework-Grounded Coaching** - All responses are anchored in the Three Big Ideas and Four Critical Questions
- **Citation-Backed Responses** - Every answer includes specific references to authoritative PLC resources
- **Facilitative Questioning** - Uses inquiry-based coaching to surface team thinking
- **Multi-Turn Conversations** - Maintains context across conversation history
- **RAG Architecture** - Combines semantic search with LLM generation for accurate, grounded responses
- **Responsive UI** - Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- **Framework:** Next.js 16.0.2 with Turbopack
- **UI Library:** React 19
- **Styling:** Tailwind CSS with Solution Tree branding
- **Components:** shadcn/ui
- **Icons:** Lucide React

### Backend
- **API:** Next.js API Routes
- **Database:** Vercel Postgres (Neon)
- **AI Model:** OpenAI GPT-4o
- **Vector Store:** Pinecone
- **Embeddings:** OpenAI text-embedding-3-small

### Deployment
- **Platform:** Vercel
- **CI/CD:** Automated via Vercel Git integration

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or bun package manager
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Pinecone account ([Sign up](https://www.pinecone.io/))
- Vercel account for Postgres database ([Sign up](https://vercel.com))

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/NaniSkinner/PLC_Coach.git
cd PLC_Coach/AI_PLC_Coach
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your API keys:

```env
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_INDEX_NAME=plc-coach-demo
PINECONE_ENVIRONMENT=us-east-1

# Database (Vercel Postgres via Neon)
POSTGRES_URL=your-postgres-connection-string
POSTGRES_PRISMA_URL=your-postgres-prisma-connection-string
POSTGRES_URL_NON_POOLING=your-postgres-non-pooling-url
POSTGRES_USER=your-postgres-user
POSTGRES_HOST=your-postgres-host
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DATABASE=your-postgres-database

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Session Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=generate-a-random-secret-key
```

### 4. Set Up Pinecone Index

1. Log in to [Pinecone Console](https://app.pinecone.io/)
2. Create a new index with these settings:
   - **Name:** `plc-coach-demo`
   - **Dimensions:** 1536 (for OpenAI text-embedding-3-small)
   - **Metric:** Cosine
   - **Cloud:** AWS
   - **Region:** us-east-1

### 5. Set Up Database

Run the database migration:

```bash
npx tsx scripts/migrate-db.ts
```

This will create the necessary tables:
- `conversations` - Stores conversation sessions
- `messages` - Stores individual messages
- `feedback` - Stores user feedback (optional)

### 6. Ingest Knowledge Base (If Not Already Done)

```bash
npx tsx scripts/ingest-pdfs.ts
```

This processes PLC documents and uploads embeddings to Pinecone.

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
AI_PLC_Coach/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # Main chat endpoint
│   │   └── sessions/
│   │       ├── route.ts           # Session management
│   │       └── [id]/route.ts      # Individual session operations
│   ├── lib/
│   │   ├── rag/
│   │   │   ├── retrieval.ts       # Vector search & reranking
│   │   │   ├── generation.ts      # LLM response generation
│   │   │   ├── citations.ts       # Citation extraction
│   │   │   └── pipeline.ts        # RAG pipeline orchestration
│   │   └── conversation/
│   │       └── manager.ts         # Database operations
│   ├── page.tsx                   # Main chat interface
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── ChatContainer.tsx          # Main chat wrapper
│   ├── MessageList.tsx            # Message display
│   ├── MessageBubble.tsx          # Individual messages
│   ├── ChatInput.tsx              # Input field
│   ├── TypingIndicator.tsx        # Loading state
│   ├── CitationPill.tsx           # Citation badges
│   └── CitationModal.tsx          # Citation details
├── types/
│   └── index.ts                   # TypeScript type definitions
├── scripts/
│   ├── migrate-db.ts              # Database setup
│   ├── ingest-pdfs.ts             # Knowledge base ingestion
│   └── test-*.ts                  # Testing scripts
├── Docs/                          # Project documentation
└── knowledge_base/                # PLC documents (PDFs)
```

## API Endpoints

### POST /api/chat
Send a message and receive a coach response.

**Request:**
```json
{
  "sessionId": "uuid",
  "message": "How do we identify essential standards?"
}
```

**Response:**
```json
{
  "messageId": "uuid",
  "role": "assistant",
  "content": "Let me help you with identifying essential standards...",
  "citations": [
    {
      "id": "uuid",
      "sourceDocument": "Learning by Doing",
      "author": "DuFour et al.",
      "relevanceScore": 0.89
    }
  ],
  "metadata": {
    "modelUsed": "gpt-4o",
    "responseTime": 15420,
    "retrievedChunks": 5
  },
  "timestamp": "2025-01-13T00:00:00.000Z"
}
```

### POST /api/sessions
Create a new conversation session.

**Request:**
```json
{
  "userId": "demo-user"
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "userId": "demo-user",
  "startedAt": "2025-01-13T00:00:00.000Z",
  "messageCount": 0
}
```

### GET /api/sessions/:id
Retrieve a specific conversation session with messages.

### GET /api/sessions?userId=demo-user
List all sessions for a user.

### DELETE /api/sessions/:id
Delete a conversation session.

## Development

### Running Tests

```bash
# Run end-to-end API tests
npx tsx scripts/test-api-e2e.ts

# Test RAG pipeline
npx tsx scripts/test-rag-pipeline.ts

# Test generation
npx tsx scripts/test-generation.ts
```

### Building for Production

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables in Vercel project settings
4. Deploy!

Vercel will automatically:
- Build the Next.js application
- Set up serverless functions for API routes
- Configure the Postgres database
- Deploy to a global CDN

### Environment Variables in Production

Make sure to add all environment variables from `.env.local` to your Vercel project settings.

## Known Limitations

- **Single-user demo** - No authentication system (designed for demonstration)
- **English language only** - Currently supports English PLC coaching
- **2000 character message limit** - To ensure optimal response quality
- **Static knowledge base** - Knowledge base from 2024, no live updates
- **Rate limiting** - 10 requests per minute per session (configurable)

## Troubleshooting

### "Module not found" errors
- Run `npm install` to ensure all dependencies are installed
- Check that `tsconfig.json` paths are correctly configured

### Database connection errors
- Verify `POSTGRES_URL` is set correctly in `.env.local`
- Run `npx tsx scripts/migrate-db.ts` to set up tables

### Pinecone errors
- Ensure your index dimensions match (1536 for text-embedding-3-small)
- Verify index name matches `PINECONE_INDEX_NAME`

### OpenAI API errors
- Check your API key is valid and has credits
- Verify you have access to GPT-4o model

## Contributing

This is a demonstration project built for educational purposes. Contributions are welcome!

### Development Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and demonstration purposes.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- PLC framework based on Solution Tree's PLC at Work® methodology
- Powered by [OpenAI](https://openai.com/) and [Pinecone](https://www.pinecone.io/)

## Contact

For questions or issues, please open a GitHub issue or contact the development team.

---

**Built with ❤️ for Professional Learning Communities**
