# BridgeAI - Family AI Learning Platform

A React-based web application that helps families learn about AI together through guided conversations, journaling, and an interactive glossary powered by real AI.

## 🚀 Features

### ✅ WORKING FEATURES (Real Implementation)

- **🤖 AI-Generated Conversation Prompts**: Get personalized discussion starters about AI topics using OpenRouter
- **📚 Interactive AI Glossary**: Ask about any AI term and get family-friendly explanations in real-time
- **📝 Family Journal**: Share thoughts and reflections with full CRUD operations and Firebase persistence
- **📊 Progress Tracking**: Real user stats, achievements, streaks, and level progression
- **🔐 Authentication**: Complete Firebase Auth with user profiles and role-based access
- **📱 Responsive Design**: Works seamlessly on all devices

### 💫 MVP Highlights

- **Real AI Integration**: Uses OpenRouter API with Claude 3.5 Sonnet for dynamic content
- **Live Data**: All user actions persist to Firebase Firestore immediately
- **Actual Functionality**: No mock data - everything works when you click it
- **End-to-End Experience**: From signup to conversation prompts to journal entries

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore)
- **AI Service**: OpenRouter (Claude 3.5 Sonnet)
- **Build Tool**: Vite
- **Deployment**: Ready for Vercel/Netlify

## 📦 Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd bridgeai
   npm install
   ```

2. **Set up credentials**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase and OpenRouter credentials
   ```

3. **Start developing**
   ```bash
   npm run dev
   ```

## 🔧 Required Configuration

### Firebase Setup (Required)
1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create Firestore database with these collections:
   - `users` - User profiles and roles
   - `journalEntries` - Family journal entries
   - `userStats` - Progress tracking data
4. Add config to `.env` file

### OpenRouter Setup (Required)
1. Get API key from [OpenRouter](https://openrouter.ai/keys)
2. Add `VITE_OPENROUTER_API_KEY` to `.env`
3. All AI features will work immediately

## 🏗️ Project Structure

```
src/
├── components/          # UI components
├── contexts/           # AuthContext with Firebase
├── pages/              # Main app pages
├── services/           # AI, Journal, UserStats services
├── types/              # TypeScript definitions
└── config/             # Firebase configuration
```

## 🎯 Key Services (All Working)

### AI Service
- ✅ Generates conversation prompts using OpenRouter
- ✅ Explains AI terms in real-time
- ✅ Updates user stats automatically

### Journal Service
- ✅ Create, read, update, delete entries
- ✅ Like and share functionality
- ✅ Real-time Firebase sync

### User Stats Service
- ✅ Track conversations, terms learned, journal entries
- ✅ Calculate learning streaks
- ✅ Award achievements and level progression

## 🔥 Real User Experience

1. **Sign Up** → Creates Firebase user + Firestore profile
2. **Dashboard** → Shows real stats, recent entries, AI-generated daily prompt
3. **Conversations** → Click "Refresh" to generate new AI prompts instantly
4. **Glossary** → Type any AI term, get explanation in seconds
5. **Journal** → Write entries that save immediately and show on dashboard
6. **Progress** → Watch stats update as you use features

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy (builds automatically)

### Environment Variables for Production
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

## 📊 Features in Detail

### Real AI-Powered Conversations
- Prompts generated based on user role (parent/child)
- Categories: daily, weekly, special topics
- Difficulty levels: beginner, intermediate, advanced
- Includes parent guidance and follow-up questions
- Updates user stats when started

### Dynamic AI Glossary
- Explains ANY AI term you type
- Family-friendly explanations with examples
- Technical details for deeper understanding
- Tips for parents on how to discuss with children
- Related terms for further exploration

### Family Journal System
- Create public or private entries
- Like and comment on family posts
- Filter by author or shared status
- Search through entries
- Connected conversation prompts

### Progress Dashboard
- Real conversation count
- Terms learned counter
- Journal entries written
- Current learning streak
- Achievement badges
- Level progression (Beginner → Intermediate → Advanced)

## 🎨 User Interface

- **Modern Design**: Clean, family-friendly interface
- **Responsive**: Works on phones, tablets, desktops
- **Intuitive**: Clear navigation and call-to-action buttons
- **Accessible**: Good contrast, readable fonts, proper spacing

## 🔒 Security & Performance

- Firebase Security Rules for user data protection
- Environment variables for API keys
- Client-side auth state management
- Optimized for fast loading and smooth interactions

## 📈 Success Metrics

Users can immediately:
- ✅ Generate real AI conversation prompts
- ✅ Get instant explanations of AI terms
- ✅ Create and share journal entries
- ✅ See their learning progress update
- ✅ Earn achievements and level up

## 🔮 Ready for Enhancement

The solid foundation supports:
- Multi-family connections
- Advanced conversation tracking
- Video guides
- Mobile app development
- Learning path recommendations

## 🎉 What Makes This Special

- **Actually Works**: No placeholders - real AI, real data, real functionality
- **User-Centered**: Designed for non-technical parents and curious kids
- **Scalable**: Firebase backend ready for thousands of families
- **Modern**: Latest React, TypeScript, and AI integration patterns
- **Complete**: Authentication to AI generation to data persistence

---

**This isn't just an MVP - it's a fully functional family AI learning platform ready for users today!** 🚀✨

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

Built for families who want to bridge the AI knowledge gap together. 💝