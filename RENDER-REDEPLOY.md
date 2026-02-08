# 🚀 Render Redeploy Instructions

## Issue
Getting 500 error on https://gpt.divyeshrupala.in because Render has old code.

## Solution: Trigger Redeploy

### Option 1: Auto-Deploy from GitHub (Recommended)
Since you just pushed to GitHub, Render should auto-deploy if enabled.

**Check Status:**
1. Go to https://dashboard.render.com
2. Find your service "multi-ai-chat"
3. Check if deployment is in progress
4. Wait for it to complete (~2-5 minutes)

### Option 2: Manual Deploy
If auto-deploy didn't trigger:

1. Go to https://dashboard.render.com
2. Select your service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete

### Option 3: Force Redeploy via Git
```bash
# Make a small change and push
git commit --allow-empty -m "Trigger Render redeploy"
git push origin main
```

## Verify Deployment

After deployment completes:

1. **Check Health:**
   ```
   https://gpt.divyeshrupala.in/health
   ```
   Should return: `{"status":"OK",...}`

2. **Check API:**
   ```
   https://gpt.divyeshrupala.in/api/test
   ```
   Should return server info

3. **Test Chat:**
   - Open https://gpt.divyeshrupala.in
   - Add your API key
   - Send a test message
   - Should work without 500 error

## Common Issues

### Deployment Failed
- Check Render logs for errors
- Verify `package.json` has correct dependencies
- Ensure `node_modules` is in `.gitignore`

### Still Getting 500 Error
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check browser console for errors
- Verify API key is added in the UI

### Environment Variables Missing
- Go to Render Dashboard → Settings → Environment
- Verify these are set:
  - `NODE_ENV=production`
  - `PORT=10000`
  - `APP_URL=https://gpt.divyeshrupala.in`

## Local Testing

Test locally before deploying:

```bash
# Start server
npm start

# Test in browser
http://localhost:3000

# Should work without errors
```

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render deployment triggered
- [ ] Deployment completed successfully
- [ ] Health check passing
- [ ] API test working
- [ ] Chat functionality working
- [ ] Mobile UI working
- [ ] No console errors

## Need Help?

Check Render logs:
1. Dashboard → Your Service
2. Click "Logs" tab
3. Look for errors in red
4. Share error messages if needed

---

**Your code is ready - just needs to be deployed to Render!** 🚀
