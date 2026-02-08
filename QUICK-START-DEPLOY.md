# 🚀 Quick Start: Deploy to chat.divyeshrupala.in

## 5-Minute Deployment Guide

### Step 1: Push to GitHub (1 min)
```bash
git add .
git commit -m "Production ready for chat.divyeshrupala.in"
git push origin main
```

### Step 2: Deploy on Render (2 min)
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render auto-detects `render.yaml` ✅
5. Click "Create Web Service"
6. Wait for deployment (~2 minutes)

### Step 3: Configure Custom Domain (2 min)
1. In Render Dashboard → Settings → Custom Domains
2. Click "Add Custom Domain"
3. Enter: `chat.divyeshrupala.in`
4. Copy the CNAME record details

### Step 4: Update DNS
1. Login to your domain provider (GoDaddy, Namecheap, etc.)
2. Go to DNS Management for `divyeshrupala.in`
3. Add CNAME record:
   ```
   Type: CNAME
   Name: chat
   Value: your-app-name.onrender.com
   TTL: 3600
   ```
4. Save changes

### Step 5: Wait & Verify (15-30 min)
1. Wait for DNS propagation (15-30 minutes)
2. SSL certificate auto-issued by Render
3. Test: `https://chat.divyeshrupala.in/health`
4. Open: `https://chat.divyeshrupala.in`

---

## ✅ Verification Commands

```bash
# Test health endpoint
curl https://chat.divyeshrupala.in/health

# Test API
curl https://chat.divyeshrupala.in/api/test

# Test providers
curl https://chat.divyeshrupala.in/api/providers

# Run test script
node test-server.js https://chat.divyeshrupala.in
```

---

## 🔧 Environment Variables (Auto-Configured)

These are automatically set from `render.yaml`:
- `NODE_ENV=production`
- `PORT=10000`
- `APP_URL=https://chat.divyeshrupala.in`

---

## 🆘 Troubleshooting

### "This site can't be reached"
- Wait 15-30 minutes for DNS propagation
- Check DNS: `nslookup chat.divyeshrupala.in`

### "Not Secure" warning
- Wait for SSL certificate (automatic after DNS propagates)
- Usually takes 5-15 minutes after DNS is verified

### 500 Error
- Check Render logs: Dashboard → Logs
- Look for error messages

### CORS Error
- Verify `server.js` has your domain in `allowedOrigins`
- Should include: `https://chat.divyeshrupala.in`

---

## 📚 Full Documentation

- **Complete Guide**: [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)
- **Checklist**: [PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md)
- **Changes**: [CHANGES-SUMMARY.md](CHANGES-SUMMARY.md)

---

## 🎉 Done!

Your app is now live at: **https://chat.divyeshrupala.in**

Users can:
- Access the chat interface
- Add their own API keys
- Chat with multiple AI providers
- Upload and analyze documents

**No server-side API keys needed!** 🔒
