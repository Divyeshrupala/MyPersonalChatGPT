# 🚀 Production Deployment Guide

## Deploying to Render with Custom Domain: chat.divyeshrupala.in

This guide walks you through deploying your Multi-AI Assistant to Render and configuring your custom subdomain.

---

## 📋 Pre-Deployment Checklist

✅ All hardcoded URLs removed (localhost, render.com)  
✅ CORS configured for custom domain  
✅ Environment variables properly set  
✅ Relative URLs used for all API calls  
✅ Health check endpoint working  
✅ Production-ready error handling  

---

## 🌐 Step 1: Deploy to Render

### Option A: Automatic Deployment (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Production ready for chat.divyeshrupala.in"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`

3. **Verify Configuration**
   - **Name**: multi-ai-chat
   - **Runtime**: Node
   - **Build Command**: `npm ci`
   - **Start Command**: `node server.js`
   - **Health Check Path**: `/health`

4. **Environment Variables** (auto-configured from render.yaml):
   - `NODE_ENV=production`
   - `PORT=10000`
   - `APP_URL=https://chat.divyeshrupala.in`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-5 minutes)

### Option B: Manual Configuration

If automatic deployment fails:

1. In Render Dashboard:
   - **Runtime**: Node.js
   - **Build Command**: `npm ci`
   - **Start Command**: `node server.js`
   - **Health Check Path**: `/health`

2. Add Environment Variables manually:
   ```
   NODE_ENV=production
   PORT=10000
   APP_URL=https://chat.divyeshrupala.in
   ```

---

## 🔗 Step 2: Configure Custom Domain

### In Render Dashboard

1. **Go to your service** → "Settings" → "Custom Domains"

2. **Add Custom Domain**:
   - Enter: `chat.divyeshrupala.in`
   - Click "Add"

3. **Get DNS Configuration**:
   Render will provide you with:
   - **CNAME Record** or **A Record** details
   - Example: `chat.divyeshrupala.in` → `your-app.onrender.com`

### In Your Domain Provider (e.g., GoDaddy, Namecheap, Cloudflare)

1. **Login to your domain provider**

2. **Go to DNS Management** for `divyeshrupala.in`

3. **Add CNAME Record**:
   ```
   Type: CNAME
   Name: chat
   Value: your-app-name.onrender.com
   TTL: 3600 (or Auto)
   ```

   OR **Add A Record** (if CNAME not supported):
   ```
   Type: A
   Name: chat
   Value: [IP provided by Render]
   TTL: 3600
   ```

4. **Save DNS Changes**
   - DNS propagation takes 5 minutes to 48 hours
   - Usually works within 15-30 minutes

---

## 🔒 Step 3: Enable HTTPS (Automatic)

Render automatically provisions SSL certificates for custom domains:

1. **Wait for DNS propagation** (15-30 minutes)
2. **Render auto-detects** your custom domain
3. **SSL certificate** is automatically issued via Let's Encrypt
4. **HTTPS enabled** - your site will be accessible at `https://chat.divyeshrupala.in`

---

## ✅ Step 4: Verify Deployment

### Test Endpoints

1. **Health Check**:
   ```bash
   curl https://chat.divyeshrupala.in/health
   ```
   Expected: `{"status":"OK",...}`

2. **API Test**:
   ```bash
   curl https://chat.divyeshrupala.in/api/test
   ```
   Expected: `{"message":"Server is working correctly",...}`

3. **Providers List**:
   ```bash
   curl https://chat.divyeshrupala.in/api/providers
   ```
   Expected: List of AI providers

4. **Main App**:
   - Open browser: `https://chat.divyeshrupala.in`
   - Should load the chat interface
   - No console errors (F12)

### Check CORS

1. Open browser console (F12)
2. Try sending a chat message
3. No CORS errors should appear
4. API calls should work from your custom domain

---

## 🛠️ Troubleshooting

### Issue: "This site can't be reached"

**Cause**: DNS not propagated yet

**Solution**:
- Wait 15-30 minutes for DNS propagation
- Check DNS with: `nslookup chat.divyeshrupala.in`
- Verify CNAME/A record is correct in domain provider

### Issue: "Not Secure" or SSL Error

**Cause**: SSL certificate not issued yet

**Solution**:
- Wait for DNS to fully propagate
- Render auto-issues SSL after DNS is verified
- Check Render dashboard for SSL status
- Can take up to 1 hour after DNS propagation

### Issue: CORS Errors in Browser

**Cause**: Custom domain not in allowed origins

**Solution**:
- Verify `server.js` has your domain in `allowedOrigins`
- Should include: `https://chat.divyeshrupala.in`
- Redeploy if you made changes

### Issue: 500 Internal Server Error

**Cause**: Server-side error

**Solution**:
1. Check Render logs: Dashboard → Logs
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Module not found errors
   - Port binding issues

### Issue: API Calls Failing

**Cause**: User API keys not configured

**Solution**:
- This is expected! Users must add their own API keys
- Click "API Keys" button in the interface
- Add keys for desired providers
- This is by design (no server-side keys)

---

## 🔄 Updating Your Deployment

### Automatic Updates (if enabled)

1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. Render auto-deploys (if `autoDeploy: true` in render.yaml)

### Manual Updates

1. Go to Render Dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete

---

## 📊 Monitoring

### Render Dashboard

- **Logs**: Real-time server logs
- **Metrics**: CPU, Memory, Bandwidth usage
- **Events**: Deployment history
- **Health**: Uptime monitoring

### Health Check Endpoint

Monitor your app:
```bash
curl https://chat.divyeshrupala.in/health
```

Returns:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "memory": {...},
  "environment": "production"
}
```

---

## 🔐 Security Checklist

✅ HTTPS enabled (automatic via Render)  
✅ CORS configured for specific domains  
✅ No API keys stored server-side  
✅ User-provided API keys (client-side only)  
✅ File upload validation and size limits  
✅ Input sanitization enabled  
✅ Rate limiting configured  
✅ Helmet security headers enabled  
✅ Non-root user in Docker (if using containers)  

---

## 📝 Environment Variables Reference

### Required for Production

```env
NODE_ENV=production
PORT=10000
APP_URL=https://chat.divyeshrupala.in
```

### Optional

```env
# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=200
CHAT_RATE_LIMIT_WINDOW=60000
CHAT_RATE_LIMIT_MAX=30

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

---

## 🎯 Post-Deployment Tasks

1. **Test all features**:
   - Chat with different AI providers
   - File upload functionality
   - Voice recognition (if supported)
   - Chat history persistence

2. **Monitor performance**:
   - Check Render metrics
   - Monitor response times
   - Watch for errors in logs

3. **Update documentation**:
   - Update README with live URL
   - Share with users
   - Document any custom configurations

4. **Set up monitoring** (optional):
   - UptimeRobot for uptime monitoring
   - Google Analytics for usage tracking
   - Sentry for error tracking

---

## 🆘 Support

If you encounter issues:

1. **Check Render Logs**: Dashboard → Logs
2. **Test Health Endpoint**: `/health`
3. **Verify DNS**: `nslookup chat.divyeshrupala.in`
4. **Check Browser Console**: F12 for client-side errors
5. **Review this guide**: Ensure all steps completed

---

## 🎉 Success!

Your Multi-AI Assistant is now live at:

**🔗 https://chat.divyeshrupala.in**

Users can:
- Access the chat interface
- Add their own API keys
- Chat with multiple AI providers
- Upload and analyze documents
- Use voice recognition

**No server-side API keys needed!** Each user provides their own keys for complete control and sustainability.

---

Made with ❤️ by Divyesh
