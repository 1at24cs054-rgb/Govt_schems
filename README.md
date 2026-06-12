# Jeevandhara 🌾
> **AI-Powered Government Scheme Recommendation & Chatbot System for Farmers**

Jeevandhara is an intelligent platform designed to bridge the information gap between farmers and government schemes. Using a personalized matching algorithm and Retrieval-Augmented Generation (RAG) powered by LangChain and Ollama (Mistral), Jeevandhara provides tailored scheme suggestions and answers user queries in a simple, farmer-friendly manner.

---

## 🚀 Key Features

*   **Farmer Profile Management**: Secure registration and login to capture demographic, income, and landholding data.
*   **Intelligent Recommendations**: Automatic calculation of eligibility based on user profile (age, annual income, land size) compared against scheme criteria.
*   **Redesigned AI Chatbot Assistant**: A modern, ChatGPT-like conversational experience tailored for farmers:
    *   **Natural Conversation**: Supports continuous, contextual follow-up questions.
    *   **Contextual Follow-up Chips**: Dynamically displays 2–3 smart suggestions (e.g. *Who is eligible?*, *Required documents?*, *How to apply?*) after answers are received.
    *   **Session Persistence**: Conversation history remains intact across page refreshes during the session.
    *   **Typing Indicator**: Real-time `"AI is typing..."` animation with bouncing dots while generating answers.
    *   **Timestamps**: Elegant timestamps on every message bubble.
    *   **Responsive Mobile Layout**: Automatically scales to almost full screen on mobile devices.
*   **Comprehensive Scheme Database**: Loaded with structural scheme profiles for APY (Atal Pension Yojana), PM-Kisan, KCC (Kisan Credit Card), and more.

---

## 🛠️ Technology Stack

*   **Frontend**: HTML5, CSS3 (Custom styling with rich aesthetics, glassmorphism, pulse, and bounce animations), Vanilla JavaScript
*   **Backend**: Python, FastAPI
*   **Database**: SQLite (SQL relational storage for farmer accounts and chat histories)
*   **Vector Database**: ChromaDB (stores embeddings of scheme documents)
*   **AI/ML Pipeline**: 
    *   **Embeddings**: HuggingFace (`sentence-transformers/all-MiniLM-L6-v2`)
    *   **LLM Model**: Ollama (`mistral`)
    *   **Orchestration**: LangChain Community Edition

---

## 📂 Project Structure

```text
Jeevandhara/
├── backend/
│   ├── main.py              # Main FastAPI application with routing & AI integration
│   ├── database.py          # SQLite database schema & connection initialization
│   ├── ai.py                # Standalone AI routing helper
│   ├── schemes.json         # Master dataset of government schemes
│   └── test_db.py           # Helper/test script for SQLite connection
├── frontend/
│   ├── index.html           # Landing page
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   ├── dashboard.html       # Farmer dashboard (profile details + scheme match + chatbot)
│   ├── style.css            # Modular stylesheet with clean glassmorphism UI
│   ├── login.js             # Client-side authorization logic
│   ├── register.js          # Client-side user input & registration requests
│   └── dashboard.js         # API integration for dashboard data and chatbot chat
├── scraper/                 # Structured JSON data containing raw government scheme rules
│   ├── aif.json             
│   ├── kcc.json             
│   ├── pmkisan.json         
│   └── ...                  
├── .gitignore               # Excludes python packages, caches, and database files
└── README.md                # Project documentation
```

---

## 📦 Setup & Installation Instructions

To run this project locally, ensure you have Python 3.8+ and Ollama installed.

### 1. Prerequisites & Ollama Configuration
Ensure Ollama is running on your machine:
1. Install [Ollama](https://ollama.com).
2. Open your terminal and pull the Mistral model:
   ```bash
   ollama pull mistral
   ```
3. Keep the Ollama service running in the background.

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a python virtual environment (optional but recommended):
   ```bash
   python -m venv .venv
   # On Windows
   .venv\Scripts\activate
   # On macOS/Linux
   source .venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install fastapi uvicorn pydantic langchain langchain-community chromadb sentence-transformers sqlite3
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```
   The API documentation will be available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
1. Simply serve the `frontend` folder using any local web server (e.g. VS Code's Live Server extension, Python's simple HTTP server, or Nginx).
2. Alternatively, you can open `index.html` directly in your web browser.
3. Access the registration page to create a profile, login, and access your matching schemes dashboard!

---

## 🔌 API Documentation

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/` | `GET` | Backend status check |
| `/register` | `POST` | Registers a new farmer user |
| `/login` | `POST` | Authenticates farmer credentials |
| `/profile/{user_id}` | `GET` | Retrieves profile statistics for a farmer |
| `/recommend/{user_id}` | `GET` | Evaluates scheme matching for a farmer |
| `/dashboard/{user_id}` | `GET` | Unified response containing profile & matches |
| `/ask/{user_id}` | `POST` | Submits a query to the Jeevandhara RAG AI Chatbot |
| `/chat-history/{user_id}` | `GET` | Retrieves conversational history logs |
| `/farmers` | `GET` | Internal debugging: dumps list of registered users |