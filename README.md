# BridgeAI - Family AI Education Platform

BridgeAI is a mobile-responsive web application designed to bridge the communication gap between parents and children around AI usage. The platform provides guided conversations, parent-friendly explanations, and shared learning experiences.

## Features

### MVP Core Features
- **Conversation Prompter**: Daily and weekly conversation starters about AI topics
- **Parent-Friendly AI Dictionary**: Jargon-free explanations of AI terms
- **Shared Family Journal**: Document insights and reflections together
- **User Authentication**: Secure login with role-based access (parent/child)
- **Mobile-Responsive Design**: Works seamlessly on all devices

### Target Users
- **Parents (30-55, non-technical)**: Get confidence to discuss AI with children
- **Children (10-17, tech-savvy)**: Learn about AI through guided family discussions

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore (ready for implementation)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bridgeai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase** (Required for authentication)
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication with Email/Password
   - Enable Firestore Database
   - Copy your config and update `src/config/firebase.ts`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:5173`

### Firebase Configuration

Replace the placeholder config in `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Project Structure

```
bridgeai/
├── src/
│   ├── components/          # Reusable components
│   │   └── Layout.tsx       # Main app layout with navigation
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── pages/               # Page components
│   │   ├── Landing.tsx      # Landing page
│   │   ├── Login.tsx        # User login
│   │   ├── Register.tsx     # User registration
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── ConversationPrompts.tsx  # Conversation starters
│   │   ├── AIGlossary.tsx   # AI terms dictionary
│   │   ├── Journal.tsx      # Family journal
│   │   └── Profile.tsx      # User profile & settings
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Core data types
│   ├── config/              # Configuration files
│   │   └── firebase.ts      # Firebase configuration
│   ├── App.tsx              # Main app component with routing
│   └── main.tsx             # App entry point
├── public/                  # Static assets
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Features Implementation

### Authentication Flow
- Role-based registration (parent/child)
- Secure Firebase authentication
- Protected routes with automatic redirection
- User profile management

### Conversation System
- Categorized prompts (daily, weekly, special)
- Difficulty levels (beginner, intermediate, advanced)
- Age-appropriate content filtering
- Parent guidance and tips

### AI Glossary
- Simple and technical explanations
- Category-based organization
- Parent-specific notes and tips
- Related terms linking

### Family Journal
- Shared and private entries
- Prompt-based reflections
- Family activity tracking
- Tag-based organization

## Database Schema (Firestore)

### Users Collection
```typescript
{
  id: string,
  email: string,
  displayName: string,
  role: 'parent' | 'child',
  parentId?: string,
  childIds?: string[],
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation Prompts Collection
```typescript
{
  id: string,
  title: string,
  description: string,
  category: 'daily' | 'weekly' | 'special',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  content: {
    parentGuidance: string,
    childQuestion: string,
    followUpQuestions: string[]
  }
}
```

### Journal Entries Collection
```typescript
{
  id: string,
  userId: string,
  familyId: string,
  title: string,
  content: string,
  isShared: boolean,
  tags: string[],
  promptId?: string,
  createdAt: Date
}
```

## Styling System

### Tailwind Classes
- `btn-primary` - Primary action buttons
- `btn-secondary` - Secondary action buttons  
- `card` - Content cards with consistent styling
- `input-field` - Form input fields

### Color Palette
- **Primary**: Blue shades for main actions and branding
- **Secondary**: Yellow/amber for highlights and accents
- **Gray Scale**: Various grays for text and backgrounds

## Next Steps for Development

### Phase 1 (Current MVP)
- ✅ Project setup and structure
- ✅ Authentication system
- ✅ Core page components
- ✅ Responsive design
- 🔄 Firebase integration (in progress)

### Phase 2 (Data & Functionality)
- [ ] Connect to Firebase Firestore
- [ ] Implement CRUD operations
- [ ] Add real conversation prompts
- [ ] Build journal entry system
- [ ] Add user progress tracking

### Phase 3 (Enhanced Features)
- [ ] Push notifications
- [ ] Family member connections
- [ ] Progress sharing
- [ ] Advanced conversation tracking
- [ ] Achievement system

### Phase 4 (Scale & Polish)
- [ ] Performance optimization
- [ ] Advanced analytics
- [ ] Content moderation
- [ ] Mobile app (React Native)
- [ ] Admin panel

## Contributing

This is an MVP foundation ready for extension. Key areas for contribution:
- Firebase integration completion
- Content creation (prompts, glossary terms)
- UX/UI improvements
- Performance optimization
- Testing implementation

## License

Built for families, by families. © 2024 BridgeAI.