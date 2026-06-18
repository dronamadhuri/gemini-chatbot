# Gemini Chatbot Full-Stack Project

This is a beautiful, full-stack chatbot application built with a **Node.js + Express** backend integrating Google's official, production-ready **Gemini API** via the `@google/genai` SDK, and a **Vite + React** frontend styled with premium Vanilla CSS.

---

## Features
- **Modern UI**: Dark mode, premium typography ("Outfit"), responsive sidebars, custom bubble alignments, and typing animations.
- **Robust Session History**: Support for starting new conversations, switching between recent chats, and deleting chat threads. Conversations are persisted automatically via the browser's LocalStorage.
- **Lightweight & Fast**: Dependency-free Markdown parsing (for bold text, lists, and code blocks) and real-time backend health check polling.
- **Official SDK**: Built using the modern, unified `@google/genai` library.

---

## Project Structure

```text
gemini-chatbot/
├── backend/
│   ├── services/
│   │   └── geminiService.js   # Gemini API integration service
│   ├── index.js               # Express server with /chat & /health endpoints
│   ├── package.json           # Backend dependencies & scripts
│   └── .env                   # Local configuration variables (git-ignored)
├── frontend/
│   ├── src/
│   │   ├── components/        # Sidebar, ChatWindow, MessageInput
│   │   ├── App.jsx            # State coordinator & message logic
│   │   ├── App.css            # Component-level styling & animations
│   │   ├── index.css          # Design system & CSS variables
│   │   └── main.jsx           # Entrypoint
│   ├── vite.config.js         # Port proxying settings
│   └── package.json           # Frontend dependencies & scripts
├── .env.example               # Template environment configuration
└── README.md                  # This setup documentation
```

---

## Setup & Installation

### Step 1: Clone and Navigate
Open your terminal inside the root `gemini-chatbot` folder.

### Step 2: Configure Backend Environment
1. Copy the `.env.example` template file into a new file named `.env` inside the `backend` folder:
   ```bash
   cp .env.example backend/.env
   ```
2. Get a free Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3. Open `backend/.env` and replace `your_gemini_api_key_here` with your actual API key:
   ```env
   PORT=5000
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.5-flash
   ```

### Step 3: Start the Backend Server
Navigate to the `backend` directory, install packages, and start the development server:
```bash
cd backend
npm install
npm run dev
```
The server will boot up at `http://localhost:5000`.

### Step 4: Start the Frontend Client
Open a second terminal window, navigate to the `frontend` directory, install packages, and boot the Vite server:
```bash
cd frontend
npm install
npm run dev
```
Vite will start the client, typically at `http://localhost:5173`. Open this URL in your browser to start chatting!

---

## Tech Details

### API Reference
- **POST `/chat`**: Communicates with the model.
  - Body:
    ```json
    {
      "message": "Hello!",
      "history": [
        {
          "role": "user",
          "parts": [{"text": "Previous message"}]
        },
        {
          "role": "model",
          "parts": [{"text": "Previous response"}]
        }
      ]
    }
    ```
  - Response:
    ```json
    { "reply": "Hi! How can I help you today?" }
    ```

- **GET `/health`**: Returns backend configuration health status.

### Dev Commands
- Run backend nodemon dev server: `npm run dev`
- Build frontend: `npm run build`
- Preview production build: `npm run preview`
