# Smart Library Assistant AI - System Architecture

## Updated Architecture (FastAPI + Groq + MongoDB)

```mermaid
flowchart LR
    U[User] --> UI[React Chat UI]
    UI --> API[/FastAPI/]
    API --> INT[Intent Classifier]
    INT --> VS[Vector Search (Embeddings)]
    API --> PR[Policy Retriever]
    VS --> LLM[Groq LLM]
    PR --> LLM
    LLM --> RESP[Structured Response]
    RESP --> UI
```

- Frontend: React + Vite + Tailwind, chat window and dashboard
- Backend: FastAPI services with routers for chat, search, user, borrow, renew
- Data: MongoDB for persistence; JSON bootstraps for books and policies
- AI: Embeddings + RAG context + Groq LLM generation; in-memory response cache

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │              │  │              │  │              │            │
│  │  Chat UI     │  │ Book Search  │  │  Dashboard   │            │
│  │  Component   │  │  Component   │  │  Component   │            │
│  │              │  │              │  │              │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                 │                 │                      │
│         └─────────────────┴─────────────────┘                      │
│                           │                                         │
│                  ┌────────▼────────┐                               │
│                  │   React Router  │                               │
│                  │   Context APIs  │                               │
│                  └────────┬────────┘                               │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Supabase SDK  │
                    │  (Auth + Data) │
                    └───────┬────────┘
                            │
┌────────────────────────────▼────────────────────────────────────────┐
│                      SUPABASE BACKEND                                │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Authentication Layer                      │  │
│  │  • JWT Token Generation                                      │  │
│  │  • Session Management                                        │  │
│  │  • User Registration/Login                                   │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Database Layer (PostgreSQL)               │  │
│  │                                                               │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐         │  │
│  │  │ profiles   │  │   books     │  │ borrowed_    │         │  │
│  │  │            │  │             │  │ books        │         │  │
│  │  └────────────┘  └─────────────┘  └──────────────┘         │  │
│  │                                                               │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐         │  │
│  │  │ policies   │  │ chat_       │  │ recommend-   │         │  │
│  │  │            │  │ history     │  │ ations       │         │  │
│  │  └────────────┘  └─────────────┘  └──────────────┘         │  │
│  │                                                               │  │
│  │  Row Level Security (RLS) enabled on all tables              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Edge Functions Layer                      │  │
│  │                                                               │  │
│  │  ┌──────────────────────────────────────────────┐           │  │
│  │  │        chat-assistant Function               │           │  │
│  │  │                                               │           │  │
│  │  │  ┌─────────────┐  ┌──────────────┐          │           │  │
│  │  │  │   Intent    │  │   Response   │          │           │  │
│  │  │  │ Classifier  │  │   Generator  │          │           │  │
│  │  │  └─────────────┘  └──────────────┘          │           │  │
│  │  │                                               │           │  │
│  │  └──────────────────────────────────────────────┘           │  │
│  └─────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

## Request Flow - Chat Message

```
1. User types message in Chat UI
2. ChatInterface.tsx POST → /api/chat { message, user_id }
3. FastAPI routes to chat handler
4. Intent detection
5. If search/recommend → vector store top-K
6. If policy → retrieve policy context
7. Build compact prompt with context snippets
8. Groq LLM generates response
9. Cache response keyed by normalized input
10. Return JSON { response, books, intent, context }
11. UI renders message and optional book cards
```

## Component Architecture

```
App.tsx (Root)
│
├── ThemeProvider (Context)
│   │
│   └── AuthProvider (Context)
│       │
│       └── AuthWrapper
│           │
│           ├── Login/Signup (Unauthenticated)
│           │
│           └── Dashboard (Authenticated)
│               │
│               ├── Header
│               │   ├── Logo
│               │   ├── Theme Toggle
│               │   ├── User Info
│               │   └── Sign Out
│               │
│               ├── Navigation Tabs
│               │   ├── AI Assistant
│               │   ├── Browse Books
│               │   └── My Books
│               │
│               └── Content Area
│                   │
│                   ├── ChatInterface
│                   │   ├── Message List
│                   │   ├── Book Results
│                   │   └── Input Field
│                   │
│                   ├── BookSearch
│                   │   ├── Search Bar
│                   │   ├── Filters
│                   │   └── Book Grid
│                   │
│                   └── BorrowedBooks
│                       ├── Active Loans
│                       └── History
```

## Data Flow Patterns

### Authentication Flow
```
1. User enters credentials
2. AuthContext.signIn() called
3. Supabase Auth API validates
4. JWT token generated
5. Session stored in local storage
6. Auth state updated globally
7. Dashboard component rendered
8. Profile fetched from database
```

### Book Search Flow
```
User Input (Chat or Search)
         │
         ▼
    Intent = "search_book"
         │
         ▼
Extract keywords from message
         │
         ▼
Query books table:
  - title ILIKE %keyword%
  - author ILIKE %keyword%
  - genre ILIKE %keyword%
         │
         ▼
Filter by availability (optional)
         │
         ▼
Return results (max 6)
         │
         ▼
Display as cards in UI
```

### Borrowing Flow (Future)
```
1. User selects book
2. Check availability (available_copies > 0)
3. Check user limit (current < max_books)
4. Create borrowed_books record
5. Decrement available_copies
6. Calculate due_date (today + loan_period)
7. Update user dashboard
8. Send confirmation
```

## Security Architecture

### Row Level Security (RLS) Policies

```
profiles table:
├── SELECT: auth.uid() = id
├── UPDATE: auth.uid() = id
└── INSERT: auth.uid() = id

books table:
└── SELECT: authenticated (all users can read)

borrowed_books table:
├── SELECT: auth.uid() = user_id
├── INSERT: auth.uid() = user_id
└── UPDATE: auth.uid() = user_id

chat_history table:
├── SELECT: auth.uid() = user_id
└── INSERT: auth.uid() = user_id

policies table:
└── SELECT: authenticated (all users can read)

recommendations table:
├── SELECT: auth.uid() = user_id
└── INSERT: auth.uid() = user_id
```

### Authentication Security
```
┌────────────────────────────────────┐
│     Supabase Auth (JWT Based)      │
│                                     │
│  ┌──────────────────────────────┐ │
│  │ Password Hashing (bcrypt)    │ │
│  └──────────────────────────────┘ │
│                                     │
│  ┌──────────────────────────────┐ │
│  │ JWT Token Generation         │ │
│  │ - Signed with secret         │ │
│  │ - Expiration: 1 hour         │ │
│  │ - Refresh token: 30 days     │ │
│  └──────────────────────────────┘ │
│                                     │
│  ┌──────────────────────────────┐ │
│  │ Session Management           │ │
│  │ - Local storage              │ │
│  │ - Auto refresh               │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
```

## AI Processing Architecture

```
┌────────────────────────────────────────────────────────────┐
│              AI + RAG Chat Processing Pipeline              │
│                                                              │
│  Step 1: Intent Classification                               │
│  - Keyword/phrase rules                                      │
│                                                              │
│  Step 2: Retrieval                                           │
│  - Vector search top‑K on compressed book texts              │
│  - Policy context fetch                                      │
│                                                              │
│  Step 3: Prompt Building                                     │
│  - Token‑optimized summaries of retrieved items              │
│  - Structured context sections                               │
│                                                              │
│  Step 4: LLM Generation (Groq)                               │
│  - Llama 3 family models                                     │
│  - Temperature: 0.3                                          │
│                                                              │
│  Step 5: Response Shaping                                    │
│  - Text + structured books + metadata                        │
│  - Cache response by normalized input                        │
└────────────────────────────────────────────────────────────┘
```

## Database Relationships

```
MongoDB Collections
│
├── users
│   ├── _id
│   ├── email
│   ├── full_name
│   └── membership_type
│
├── books
│   ├── id
│   ├── title, author, genre, keywords[], summary
│   ├── availability, copies, location, cover_url
│   └── embeddings (optional)
│
├── borrowed_books
│   ├── id, user_id, book_id
│   ├── borrowed_date, due_date, returned_date
│   ├── renewed_count, status, fine_amount
│   └── usage_logs[]
│
├── policies
│   ├── borrowing_limits{}
│   ├── renewal_rules{}
│   ├── fine_per_day
│   └── membership_rules{}
│
└── chat_history
    ├── id, user_id, message, response
    ├── intent, context
    └── created_at
```

## API Design

- POST /api/chat → Chat with intent detection, RAG, Groq generation
- POST /api/search → Semantic book search (vector top‑K)
- GET /api/user/{id} → Basic user profile
- POST /api/borrow → Create borrow record and due date
- GET /api/renew/eligibility → Check renewal eligibility
- GET /api/health → Health check

## State Management

```
Application State
│
├── Global State (React Context)
│   ├── AuthContext
│   │   ├── user
│   │   ├── session
│   │   ├── loading
│   │   └── auth methods
│   │
│   └── ThemeContext
│       ├── theme (light/dark)
│       └── toggleTheme()
│
└── Component State (useState)
    ├── ChatInterface
    │   ├── messages[]
    │   ├── input
    │   ├── loading
    │   └── bookResults[]
    │
    ├── BookSearch
    │   ├── books[]
    │   ├── filteredBooks[]
    │   ├── searchTerm
    │   ├── selectedGenre
    │   └── availableOnly
    │
    └── BorrowedBooks
        └── borrowedBooks[]
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                     │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                Frontend (Static Hosting)                │ │
│  │  - Vite production build                                │ │
│  │  - Optimized bundle                                     │ │
│  │  - CDN distribution                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                  │
│                            │ HTTPS                            │
│                            ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Supabase Cloud (Backend)                   │ │
│  │                                                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │ Auth Server  │  │ PostgreSQL   │  │ Edge Runtime │ │ │
│  │  │ (Multi-AZ)   │  │ (Replicated) │  │ (Deno)       │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  │                                                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Performance Considerations

### Frontend Optimization
- Code splitting by route
- Lazy loading of components
- Image optimization
- Debounced search input
- Virtualized lists for large datasets

### Backend Optimization
- Database indexes on frequent queries
- Connection pooling
- Query result caching
- Edge function cold start optimization
- RLS policy optimization

### Database Indexes
```sql
-- Books table
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_author ON books(author);

-- Borrowed books table
CREATE INDEX idx_borrowed_books_user ON borrowed_books(user_id);
CREATE INDEX idx_borrowed_books_status ON borrowed_books(status);

-- Vector search (future)
CREATE INDEX idx_books_embedding ON books
  USING ivfflat (embedding vector_cosine_ops);
```

## Scalability Design

### Horizontal Scaling
- Stateless Edge Functions
- Database read replicas
- CDN for static assets
- Multi-region deployment

### Vertical Scaling
- Database connection pooling
- Optimized queries
- Efficient data models
- Caching strategies

## Monitoring & Observability

```
Application Monitoring
│
├── Frontend
│   ├── Error tracking
│   ├── Performance metrics
│   └── User analytics
│
├── Backend
│   ├── Edge Function logs
│   ├── Database query performance
│   ├── Authentication metrics
│   └── API response times
│
└── Business Metrics
    ├── Chat interactions
    ├── Book searches
    ├── User engagement
    └── Conversion rates
```

---

This architecture is designed for:
- **Scalability**: Handle growing user base
- **Security**: Protect user data and privacy
- **Performance**: Fast response times
- **Maintainability**: Clean, modular code
- **Extensibility**: Easy to add new features
