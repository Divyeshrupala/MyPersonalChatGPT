# 🧪 API Testing Guide

Complete guide to test all AI provider APIs and troubleshoot common issues.

---

## 🔑 Quick Test Commands

### Test All APIs at Once:
```bash
# Test OpenAI
node test-api-key.js

# Test Gemini
node test-gemini.js YOUR_GEMINI_API_KEY

# Test from PowerShell
.\test-api-key.ps1
```

---

## 🤖 OpenAI API

### Get API Key:
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy and save the key

### Test API Key:
```bash
node test-api-key.js
```

### Common Issues:

#### ❌ "Quota exceeded"
**Solution**: Add credits to your account
- Go to: https://platform.openai.com/account/billing
- Add payment method
- Add at least $5 in credits

#### ❌ "Invalid API key"
**Solution**: 
- Check if key starts with `sk-proj-` or `sk-`
- Make sure you copied the complete key
- Generate a new key if needed

#### ❌ "Rate limit exceeded"
**Solution**: Wait 1 minute and try again

---

## ✨ Google Gemini API

### Get API Key:
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API key"
3. Select or create a Google Cloud project
4. Copy the API key

### Test API Key:
```bash
node test-gemini.js YOUR_API_KEY
```

### Available Models:
- `gemini-1.5-flash` (Fast, recommended)
- `gemini-1.5-pro` (More capable)
- `gemini-pro` (Legacy)

### Common Issues:

#### ❌ "Failed to fetch"
**Causes**:
1. Wrong model name
2. API not enabled
3. Invalid API key
4. Network/CORS issue

**Solutions**:
1. Use correct model: `gemini-1.5-flash`
2. Enable Gemini API in Google Cloud Console
3. Check API key format: starts with `AIzaSy`
4. Check internet connection

#### ❌ "API key not valid"
**Solution**:
- Go to: https://console.cloud.google.com/apis/credentials
- Check if API key is enabled
- Enable "Generative Language API"

#### ❌ "Safety filters blocked response"
**Solution**: Rephrase your request to be less sensitive

---

## ⚡ Groq API

### Get API Key:
1. Go to: https://console.groq.com/keys
2. Sign up/Login
3. Create new API key
4. Copy the key (starts with `gsk_`)

### Available Models:
- `llama-3.1-8b-instant` (Fast, recommended)
- `llama-3.1-70b-versatile` (More capable)
- `mixtral-8x7b-32768` (Long context)

### Test:
```javascript
// In your app, just add the API key and select Groq
```

### Common Issues:

#### ❌ "Invalid API key"
**Solution**: Key must start with `gsk_`

#### ❌ "Rate limit"
**Solution**: Groq has generous free tier, wait a moment

---

## 🧠 DeepSeek API

### Get API Key:
1. Go to: https://platform.deepseek.com/api_keys
2. Sign up/Login
3. Create API key
4. Copy the key

### Available Models:
- `deepseek-chat` (General purpose)
- `deepseek-coder` (Coding tasks)

### Common Issues:

#### ❌ "Insufficient balance"
**Solution**: Add credits to your DeepSeek account

---

## 🎨 Stability AI

### Get API Key:
1. Go to: https://platform.stability.ai/account/keys
2. Sign up/Login
3. Create API key
4. Add credits (required)

### Common Issues:

#### ❌ "Insufficient credits"
**Solution**: Purchase credits on Stability AI platform

---

## 🌐 OpenRouter

### Get API Key:
1. Go to: https://openrouter.ai/keys
2. Sign up/Login
3. Create API key
4. Add credits (optional, some models are free)

### Available Models:
- `anthropic/claude-3.5-sonnet` (Best quality)
- `anthropic/claude-3-haiku` (Fast)
- `meta-llama/llama-3.1-8b-instruct` (Free)
- `openai/gpt-4o-mini` (Balanced)

### Common Issues:

#### ❌ "Insufficient credits"
**Solution**: Add credits or use free models

---

## 🔧 Troubleshooting Steps

### Step 1: Check API Key Format
```javascript
// OpenAI: sk-proj-... or sk-...
// Gemini: AIzaSy...
// Groq: gsk_...
// DeepSeek: sk-...
// Stability: sk-...
// OpenRouter: sk-or-v1-...
```

### Step 2: Test API Key
Use the test scripts provided:
```bash
node test-api-key.js        # OpenAI
node test-gemini.js API_KEY # Gemini
```

### Step 3: Check Network
```bash
# Test internet connection
ping google.com

# Test API endpoint
curl https://api.openai.com/v1/models
```

### Step 4: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

### Step 5: Verify Account Status
- Check billing/credits
- Verify API is enabled
- Check rate limits
- Review usage quotas

---

## 💡 Best Practices

### 1. API Key Security
- ✅ Never commit API keys to Git
- ✅ Use environment variables
- ✅ Rotate keys regularly
- ✅ Use different keys for dev/prod

### 2. Error Handling
- ✅ Always catch errors
- ✅ Provide user-friendly messages
- ✅ Log errors for debugging
- ✅ Implement retry logic

### 3. Rate Limiting
- ✅ Respect API rate limits
- ✅ Implement exponential backoff
- ✅ Cache responses when possible
- ✅ Use appropriate timeouts

### 4. Cost Management
- ✅ Monitor usage regularly
- ✅ Set spending limits
- ✅ Use cheaper models when possible
- ✅ Implement request quotas

---

## 🆘 Common Error Messages

### "Failed to fetch"
**Causes**: Network issue, CORS, wrong URL, API down
**Fix**: Check internet, verify API endpoint, check CORS settings

### "Invalid API key"
**Causes**: Wrong key, expired key, wrong format
**Fix**: Verify key format, generate new key, check account

### "Rate limit exceeded"
**Causes**: Too many requests
**Fix**: Wait and retry, implement rate limiting

### "Quota exceeded"
**Causes**: No credits, usage limit reached
**Fix**: Add credits, upgrade plan, wait for reset

### "Model not found"
**Causes**: Wrong model name, model deprecated
**Fix**: Check available models, use correct name

### "Safety filters"
**Causes**: Content blocked by AI safety
**Fix**: Rephrase request, adjust safety settings

---

## 📞 Support Resources

### OpenAI:
- Docs: https://platform.openai.com/docs
- Status: https://status.openai.com
- Support: https://help.openai.com

### Google Gemini:
- Docs: https://ai.google.dev/docs
- Console: https://console.cloud.google.com
- Support: https://support.google.com

### Groq:
- Docs: https://console.groq.com/docs
- Status: https://status.groq.com
- Discord: https://groq.com/discord

### DeepSeek:
- Docs: https://platform.deepseek.com/docs
- Support: support@deepseek.com

### Stability AI:
- Docs: https://platform.stability.ai/docs
- Support: https://platform.stability.ai/support

### OpenRouter:
- Docs: https://openrouter.ai/docs
- Discord: https://discord.gg/openrouter

---

## ✅ Quick Checklist

Before asking for help, verify:
- [ ] API key is correct and complete
- [ ] API key format matches provider
- [ ] Account has sufficient credits
- [ ] API is enabled in provider console
- [ ] Internet connection is working
- [ ] No firewall/proxy blocking requests
- [ ] Using correct model names
- [ ] Browser console shows no errors
- [ ] Server logs show no errors
- [ ] Tested with provided test scripts

---

**Last Updated**: February 6, 2026
**Version**: 1.0.0