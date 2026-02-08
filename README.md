# 🤖 Multi-AI Assistant

A powerful, multi-provider AI chatbot that lets you choose between OpenAI GPT, Google Gemini, Groq, and DeepSeek models - all in one place! Now with **user-provided API keys** for complete control and sustainability.

**🔗 Live Demo**: [https://chat.divyeshrupala.in](https://chat.divyeshrupala.in)

## ✨ Features

- **Multiple AI Providers**: Switch between OpenAI, Gemini, Groq, and DeepSeek
- **User-Provided API Keys**: Secure, client-side API key storage (like Cursor IDE)
- **Model Selection**: Choose specific models for each provider
- **Smart Chat Interface**: Modern, responsive UI with real-time messaging
- **Document Processing**: Upload and analyze various file formats (TXT, DOCX, XLSX, CSV)
- **Voice Recognition**: Speak to your AI assistant (supported browsers)
- **File Upload**: Drag & drop or click to upload documents
- **Chat History**: Persistent chat history with local storage
- **Provider Badges**: See which AI model responded to each message
- **Error Handling**: Robust error handling with provider-specific messages

## 🔑 API Key System

This application uses a **user-provided API key system** for sustainability and security:

### Why User-Provided Keys?
- **💰 No Server Costs**: No API rate limits or server-side expenses
- **🔒 Security**: Your keys stay in your browser, never sent to our servers
- **⚡ Direct Access**: Direct connection to AI providers without intermediaries
- **🎛️ Full Control**: You manage your own usage and billing

### How to Set Up API Keys

1. **Click the "API Keys" button** in the interface
2. **Add your keys** for the providers you want to use
3. **Keys are stored locally** in your browser using localStorage
4. **Start chatting** with your preferred AI providers!

### Get Your API Keys From:
- **🤖 OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **✨ Google Gemini**: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- **⚡ Groq**: [console.groq.com/keys](https://console.groq.com/keys)
- **🧠 DeepSeek**: [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys)

## 🧠 Supported AI Providers

### 🤖 OpenAI GPT
- **Models**: GPT-4o, GPT-4o-mini, GPT-3.5-turbo
- **Best for**: General conversations, creative writing, complex reasoning

### ✨ Google Gemini
- **Models**: Gemini-2.5-flash, Gemini-2.5-pro, Gemini-flash-latest, Gemini-pro-latest
- **Best for**: Multimodal tasks, fast responses, Google integration

### ⚡ Groq
- **Models**: Llama-3.1-70b-versatile, Llama-3.1-8b-instant, Mixtral-8x7b-32768
- **Best for**: Ultra-fast inference, open-source models

### 🧠 DeepSeek
- **Models**: DeepSeek-chat, DeepSeek-coder
- **Best for**: Advanced reasoning, coding assistance

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Your own API keys from the providers you want to use

### Local Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd multi-ai-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

5. **Configure your API keys** using the "API Keys" button in the interface

**Note**: No server-side `.env` file needed! All API keys are managed through the user interface.

### 🌐 Deploy to Render with Custom Domain

For detailed deployment instructions to `https://chat.divyeshrupala.in`, see **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)**.

#### Quick Start

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your repository
   - Render auto-detects `render.yaml`

3. **Configure Custom Domain**:
   - In Render: Settings → Custom Domains
   - Add: `chat.divyeshrupala.in`
   - Update DNS with provided CNAME record

4. **Environment Variables** (auto-configured):
   - `NODE_ENV=production`
   - `PORT=10000`
   - `APP_URL=https://chat.divyeshrupala.in`

5. **Deploy & Verify**:
   - Wait for deployment (2-5 minutes)
   - Test: `https://chat.divyeshrupala.in/health`
   - HTTPS auto-enabled via Let's Encrypt

**📖 Full Guide**: See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) for complete instructions, troubleshooting, and DNS configuration.

#### Deployment Checklist
#### Deployment Checklist
- ✅ `render.yaml` configured correctly
- ✅ `package.json` has correct start script
- ✅ Health check endpoint working (`/health`)
- ✅ All dependencies in package.json
- ✅ No hardcoded URLs (all relative or environment-based)
- ✅ CORS configured for custom domain
- ✅ Environment variables set (`APP_URL`, `NODE_ENV`, `PORT`)

**Test your deployment**:
- Health check: `https://chat.divyeshrupala.in/health`
- Main app: `https://chat.divyeshrupala.in`
- API test: `https://chat.divyeshrupala.in/api/test`

## 📁 Project Structure

```
├── server.js              # Main server file
├── routes/
│   ├── chat.js            # Chat API routes
│   └── upload.js          # File upload routes
├── middleware/
│   └── upload.js          # File upload middleware
├── utils/
│   └── fileProcessor.js   # File processing utilities
├── public/
│   └── index.html         # Frontend interface
├── uploads/               # Temporary file storage
└── .env                   # Environment variables
```

## 🔧 API Endpoints

### POST `/api/chat`
Send a message to any AI provider with user-provided API key.

**Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "provider": "openai",
  "model": "gpt-4o-mini",
  "apiKey": "your_api_key_here"
}
```

**Response:**
```json
{
  "reply": "Hello! How can I help you today?",
  "provider": "OpenAI GPT",
  "model": "gpt-4o-mini"
}
```

### POST `/api/upload`
Upload a file and get AI analysis from any provider with user-provided API key.

**Form Data:**
- `file`: The uploaded file
- `message`: Optional message to accompany the file
- `provider`: AI provider to use (openai, gemini, groq, deepseek)
- `model`: Specific model (optional)
- `apiKey`: User's API key for the selected provider

**Response:**
```json
{
  "extracted": "File content preview...",
  "summary": "AI analysis of the file",
  "fileName": "document.pdf",
  "provider": "Google Gemini",
  "model": "gemini-2.5-flash"
}
```

### GET `/api/providers`
Get list of available AI providers and their models.

**Response:**
```json
{
  "providers": {
    "openai": {
      "name": "OpenAI GPT",
      "models": ["gpt-4o", "gpt-4o-mini"],
      "defaultModel": "gpt-4o-mini",
      "icon": "🤖"
    }
  }
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📄 Supported File Types

- **Text Files**: `.txt`
- **Word Documents**: `.docx`
- **Excel Spreadsheets**: `.xlsx`
- **CSV Files**: `.csv`

Maximum file size: 5MB

## 🎨 Features Overview

### Modern UI/UX
- Gradient backgrounds and smooth animations
- Responsive design for all screen sizes
- Font Awesome icons for better visual appeal
- Loading states and error handling

### Voice Recognition
- Click the microphone button to start voice input
- Supports modern browsers with Web Speech API
- Automatic message sending after voice recognition

### File Processing
- Intelligent text extraction from various formats
- Password-protected file detection
- File size validation
- Secure file cleanup after processing

### Chat Management
- Persistent chat history using localStorage
- Clear chat functionality
- Message timestamps
- Typing indicators

## 🔒 Security Features

- File type validation
- File size limits
- Input sanitization
- Error message sanitization
- Secure file cleanup

## 🛠️ Development

### Environment Variables
```env
PORT=3000
NODE_ENV=development
```

**Note**: No API keys needed in server environment! All keys are managed client-side.

### Scripts
- `npm start`: Start production server
- `npm run dev`: Start development server with auto-reload
- `npm test`: Run tests (placeholder)

## 🔒 Security & Privacy Features

- **Client-Side Key Storage**: API keys stored locally using browser localStorage
- **No Server-Side Keys**: Zero API keys stored on the server
- **Direct Provider Communication**: Your browser communicates directly with AI providers
- **File Type Validation**: Secure file upload validation
- **File Size Limits**: Maximum 5MB file uploads
- **Input Sanitization**: All inputs are properly sanitized
- **Secure File Cleanup**: Temporary files are automatically deleted
- **No Data Logging**: No chat history or API keys logged on server

## 🆘 Troubleshooting

### Common Issues

**"API key is required" error**
- Click the "API Keys" button and add your key for the selected provider
- Make sure you're using the correct API key format for each provider

**"Invalid API key" error**
- Verify your API key is correct and active
- Check if you have sufficient credits/quota with the provider
- Ensure the API key has the necessary permissions

**File upload failed**
- Check file size (max 5MB)
- Ensure file type is supported
- Make sure you have configured an API key for the selected provider

**Voice recognition not working**
- Use a supported browser (Chrome recommended)
- Allow microphone permissions
- Check browser console for errors

### API Key Formats
- **OpenAI**: `sk-proj-...` or `sk-...`
- **Gemini**: `AIzaSy...`
- **Groq**: `gsk_...`
- **DeepSeek**: `sk-...`

## 📞 Support

For issues and questions, please check the troubleshooting section or create an issue in the repository.

---

Made with ❤️ by Divyesh