# EduGen AI

EduGen AI is an adaptive AI learning engine that converts study materials into structured summaries, intelligent quizzes, and mastery-based learning insights using Retrieval-Augmented Generation (RAG), LLMs, and semantic search.

Developed as a modern replacement for the "Hush" project, it features a premium, dynamic frontend built with React, Vite, and Shadcn UI, paired with a robust FastAPI backend.

## 🚀 Features

- **Adaptive AI Summarization**: Generate high-quality summaries from study materials.
- **Intelligent Quiz Generation**: Automatically create quizzes to test knowledge.
- **Topic Extraction**: Semantic search and identification of key concepts.
- **Learning Mastery Tracking**: Monitor progress with mastery-based insights.
- **Premium UI**: Modern Sky Blue theme with Shadcn UI for focused learning.
- **Secure Authentication**: Built-in user profiles and progress saving.

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: SQLAlchemy with SQLite
- **AI/LLM**: RAG-based summarization and quiz engine.
- **Embeddings**: Vector stores for semantic search.

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: Lucide React

## 📂 Project Structure

```bash
edugen-ai-learning-engine/
├── app/                # FastAPI Backend
│   ├── auth/           # Authentication logic
│   ├── database/       # DB models and session management
│   ├── routes/         # API endpoints (upload, auth, quiz)
│   └── services/       # Core AI services (LLM, RAG, etc.)
├── frontend/           # Modern TypeScript + Shadcn UI Frontend
├── frontend_old/       # Legacy JavaScript-based frontend
├── requirements.txt    # Python dependencies
└── .env                # Configuration
```

## ⚙️ Setup and Installation

### Backend
1. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure `.env`.
4. Run: `uvicorn app.main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 📄 License

This project is licensed under the MIT License.
