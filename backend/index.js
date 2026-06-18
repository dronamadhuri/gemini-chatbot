import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateChatResponse } from './services/geminiService.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Enable CORS for backend-frontend communication
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// POST /chat endpoint
app.post('/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'The "message" field is required and must be a string.'
    });
  }

  try {
    const responseText = await generateChatResponse(message, history || []);
    return res.status(200).json({
      reply: responseText
    });
  } catch (error) {
    console.error('Error in /chat endpoint:', error);
    
    // Check if the error is related to missing API key
    if (error.message.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        error: 'Configuration Error',
        message: 'Gemini API Key is missing on the server. Please check the backend configuration.'
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An error occurred while generating response from Gemini API.'
    });
  }
});

// GET /health endpoint for diagnostics
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: {
      port,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      hasApiKey: !!process.env.GEMINI_API_KEY
    }
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`=========================================`);
  console.log(`Backend server running at http://localhost:${port}`);
  console.log(`Send POST requests to http://localhost:${port}/chat`);
  console.log(`=========================================`);
});
