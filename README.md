# EduGen AI

EduGen AI is an adaptive AI learning engine that converts study materials into structured summaries, intelligent quizzes, and mastery-based learning insights using Retrieval-Augmented Generation (RAG), LLMs, and semantic search.

## 🚀 Features

- **Adaptive AI Summarization**: Generate high-quality summaries from study materials.
- **Intelligent Quiz Generation**: Automatically create quizzes to test knowledge.
- **Topic Extraction**: Semantic search and identification of key concepts.
- **Learning Mastery Tracking**: Monitor progress with mastery-based insights.
- **Premium UI**: Modern Sky Blue theme for focused learning.
- **Secure Authentication**: Built-in user profiles and progress saving.

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: SQLAlchemy with SQLite
- **AI/LLM**: RAG-based summarization and quiz engine.
- **Embeddings**: Vector stores for semantic search.

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## 📂 Project Structure

```bash
edugen-ai-learning-engine/
├── app/                # FastAPI Backend
│   ├── auth/           # Authentication logic
│   ├── database/       # DB models and session management
│   ├── routes/         # API endpoints (upload, auth, quiz)
│   └── services/       # Core AI services (LLM, RAG, etc.)
├── frontend/           # React Frontend
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
