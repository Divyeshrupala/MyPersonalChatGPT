# 🔧 Troubleshooting Guide

## 🚀 Render Deployment Issues

### Error: Cannot find module '/opt/render/project/src/start'

**Problem**: Render is trying to run `node start` instead of the correct start command.

**Solutions**:

1. **Check render.yaml configuration**:
   ```yaml
   services:
     - type: web
       name: multi-ai-chat
       runtime: node
       plan: free
       buildCommand: npm ci
       startCommand: node server.js
       healthCheckPath: /health
   ```

2. **Manual Render Dashboard Configuration**:
   - Go to your Render dashboard
   - Select your service
   - Go to Settings
   - Set Build Command: `npm ci`
   - Set Start Command: `node server.js`
   - Save changes and redeploy

3. **Alternative start commands to try**:
   - `npm start`
   - `node server.js`
   - `npm run production`

### Build Command Issues

**Use `npm ci` instead of `npm install`** for faster, more reliable builds in production.

### Environment Variables for Render

Make sure these are set in Render dashboard:
- `NODE_ENV=production`
- `PORT=10000` (Render's default)

### Deployment Checklist

Before deploying to Render:
1. ✅ `render.yaml` configured correctly
2. ✅ `package.json` has correct start script
3. ✅ Health check endpoint working (`/health`)
4. ✅ All dependencies in package.json
5. ✅ No hardcoded localhost URLs

## User-Provided API Keys System

This application now uses **user-provided API keys** instead of server-side keys. This means:

- ✅ No server-side API costs or rate limits
- ✅ Your keys stay secure in your browser
- ✅ Direct connection to AI providers
- ✅ You control your own usage and billing

## Common Issues & Solutions

### 🔑 API Key Issues

**"API key is required" error**
- Click the "API Keys" button in the interface
- Add your API key for the selected provider
- Make sure the key is properly formatted

**"Invalid API key" error**
- Verify your API key is correct and active
- Check if you have sufficient credits/quota with the provider
- Ensure the API key has the necessary permissions

**API key formats:**
- **OpenAI**: `sk-proj-...` or `sk-...`
- **Gemini**: `AIzaSy...`
- **Groq**: `gsk_...`
- **DeepSeek**: `sk-...`

### 📁 File Upload Issues

**"File upload failed"**
- Check file size (maximum 5MB)
- Ensure file type is supported (TXT, DOCX, XLSX, CSV)
- Make sure you have configured an API key for the selected provider
- Try refreshing the page and uploading again

**"Could not extract text from file"**
- File might be corrupted or password-protected
- Try converting the file to a different format
- Ensure the file actually contains text content

### 🎤 Voice Recognition Issues

**Voice recognition not working**
- Use a supported browser (Chrome recommended)
- Allow microphone permissions when prompted
- Check browser console for errors (F12 → Console)
- Try refreshing the page

**"Speech recognition not supported"**
- Your browser doesn't support the Web Speech API
- Try using Google Chrome or Microsoft Edge
- Update your browser to the latest version

### 🌐 Network & Connection Issues

**"Failed to get response from AI"**
- Check your internet connection
- Verify your API key has sufficient quota/credits
- Try switching to a different AI provider
- Check if the AI provider's service is down

**Slow responses**
- Some AI providers are faster than others
- Groq typically provides the fastest responses
- Large files take longer to process
- Try using a smaller model for faster responses

### 💾 Browser & Storage Issues

**API keys not saving**
- Enable localStorage in your browser
- Clear browser cache and try again
- Check if you're in private/incognito mode
- Try a different browser

**Chat history not loading**
- Clear browser cache and localStorage
- Check browser console for errors
- Try refreshing the page

### 🔄 Provider-Specific Issues

**OpenAI Issues:**
- Quota exceeded: Add credits to your OpenAI account
- Rate limit: Wait a few minutes and try again
- Model not available: Try a different model

**Gemini Issues:**
- Free tier limits: Check your usage at ai.google.dev
- Region restrictions: Gemini may not be available in your region
- Safety filters: Try rephrasing your request

**Groq Issues:**
- Model deprecated: Some models are discontinued, try newer ones
- Rate limits: Groq has generous free limits but they exist
- Service availability: Groq is in beta, occasional downtime

**DeepSeek Issues:**
- Account verification: Some features require verified accounts
- Regional availability: May not be available in all regions
- Credit system: Check your account balance

## 🆘 Getting Help

### Step 1: Check Browser Console
1. Press F12 to open developer tools
2. Go to the "Console" tab
3. Look for error messages in red
4. Share these errors when asking for help

### Step 2: Try Basic Troubleshooting
1. Refresh the page
2. Clear browser cache
3. Try a different browser
4. Check your internet connection
5. Verify your API keys are correct

### Step 3: Test with Different Providers
1. Try switching to a different AI provider
2. Use a different model within the same provider
3. Test with a simple message first

### Step 4: Check Provider Status
- **OpenAI**: [status.openai.com](https://status.openai.com)
- **Google**: [status.cloud.google.com](https://status.cloud.google.com)
- **Groq**: [status.groq.com](https://status.groq.com)
- **DeepSeek**: Check their official website

## 📋 System Requirements

**Minimum Requirements:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection
- Valid API keys for desired providers

**Recommended:**
- Google Chrome (best compatibility)
- Stable internet connection
- Updated browser version

## 🔒 Security Best Practices

1. **Never share your API keys** with anyone
2. **Use different keys** for different applications
3. **Monitor your usage** on provider dashboards
4. **Revoke keys** if you suspect they're compromised
5. **Keep your browser updated** for security patches

## 💡 Tips for Best Experience

1. **Start with Groq** for fastest responses
2. **Use Gemini** for free tier usage
3. **Try OpenAI** for highest quality responses
4. **Use DeepSeek** for coding tasks
5. **Keep files under 1MB** for faster processing
6. **Use clear, specific prompts** for better results

---

If you're still having issues after trying these solutions, please check the GitHub repository for more help or create an issue with:
- Your browser and version
- The exact error message
- Steps to reproduce the problem
- Console errors (if any)