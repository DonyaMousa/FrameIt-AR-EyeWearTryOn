# Environment Variables Guide - FrameIt

Complete guide to understanding and setting up environment variables for FrameIt deployment.

## 📋 What are Environment Variables?

Environment variables are configuration values that your application uses but are stored **outside** your code. This is important for:

- **Security**: Keep secrets (passwords, API keys) out of your code
- **Flexibility**: Use different values for development vs production
- **Portability**: Same code works in different environments

Think of them as settings that change based on where your app runs (your computer, Render, Vercel, etc.).

---

## 🔧 How to Add Environment Variables on Render

### Step-by-Step Instructions

1. **Go to Render Dashboard**
   - Sign in to [render.com](https://render.com)
   - Click on your service (e.g., "frameit-backend")

2. **Navigate to Environment Tab**
   - In your service dashboard, click **"Environment"** tab
   - You'll see a section for "Environment Variables"

3. **Add Each Variable**
   - Click **"Add Environment Variable"** button
   - Enter the **Key** (variable name)
   - Enter the **Value** (the actual value)
   - Click **"Save Changes"**

4. **Repeat for All Variables**
   - Add each variable one by one
   - Render will save them automatically

5. **Redeploy (if needed)**
   - After adding variables, Render may auto-redeploy
   - Or manually trigger a redeploy

---

## 📝 Required Environment Variables for FrameIt

### Backend (Render)

Add these in Render dashboard under your service's "Environment" tab:

#### 1. MONGO_URI (Required)
```
Key: MONGO_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/frameit?retryWrites=true&w=majority
```

**How to get this:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<dbname>` with `frameit` (or your database name)

**Example:**
```
mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/frameit?retryWrites=true&w=majority
```

---

#### 2. PORT (Optional - Render assigns automatically)
```
Key: PORT
Value: 10000
```

**Note:** Render automatically assigns a port, but you can set this if needed. Your code uses `process.env.PORT || 5001`, so it will work either way.

---

#### 3. NODE_ENV (Required)
```
Key: NODE_ENV
Value: production
```

This tells Node.js you're in production mode (optimizations, error handling, etc.).

---

#### 4. JWT_SECRET (Required - Security Critical!)
```
Key: JWT_SECRET
Value: your-super-secret-random-string-minimum-32-characters-long
```

**How to generate:**
- Use a random string generator
- Minimum 32 characters
- Mix of letters, numbers, and symbols
- **Never share this or commit it to Git!**

**Example (generate your own!):**
```
aB3$kL9#mN2@pQ7&rS5*tU1!vW4^xY6%zA8
```

**Online generator:** https://randomkeygen.com/

---

#### 5. JWT_EXPIRE (Optional)
```
Key: JWT_EXPIRE
Value: 7d
```

How long authentication tokens last. Options:
- `7d` = 7 days
- `24h` = 24 hours
- `1h` = 1 hour

---

#### 6. FRONTEND_URL (Required)
```
Key: FRONTEND_URL
Value: https://your-frontend.vercel.app
```

**Replace with your actual Vercel frontend URL:**
- If deployed to Vercel: `https://your-project.vercel.app`
- If custom domain: `https://yourdomain.com`
- **Important:** Must match exactly (including `https://`)

This is used for CORS (Cross-Origin Resource Sharing) to allow your frontend to access the backend.

---

#### 7. API_URL (Optional)
```
Key: API_URL
Value: https://your-backend.onrender.com/api
```

Your Render backend URL. This is optional but useful for logging/reference.

**Get this after deployment:**
- Render provides: `https://your-service-name.onrender.com`
- Add `/api` at the end

---

## 🎨 Frontend Environment Variables (Vercel)

### VITE_API_URL (Required)

```
Key: VITE_API_URL
Value: https://your-backend.onrender.com/api
```

**How to add in Vercel:**
1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend.onrender.com/api`
5. Select **Production**, **Preview**, and **Development**
6. Click **Save**
7. Redeploy your frontend

**Important:** 
- Must start with `VITE_` for Vite to expose it
- Use your actual Render backend URL
- Include `/api` at the end

---

## 📋 Complete Environment Variables Checklist

### Backend (Render) - Copy & Paste Ready

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/frameit?retryWrites=true&w=majority
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend.vercel.app
API_URL=https://your-backend.onrender.com/api
```

### Frontend (Vercel) - Copy & Paste Ready

```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Use strong, random JWT_SECRET (32+ characters)
- Never commit environment variables to Git
- Use different values for development and production
- Rotate secrets periodically
- Use MongoDB Atlas IP whitelist (add Render IPs)

### ❌ DON'T:
- Share environment variables publicly
- Use weak passwords for JWT_SECRET
- Commit `.env` files to Git
- Use production secrets in development
- Hardcode secrets in your code

---

## 🧪 Testing Environment Variables

### Check if Variables are Set

**In Render Logs:**
After deployment, check logs to see if variables are loaded:
```
✅ MongoDB connected
🌍 Environment: production
```

**Test Health Endpoint:**
```bash
curl https://your-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "FrameIt API is running",
  "database": "connected"
}
```

---

## 🔄 Updating Environment Variables

### On Render:
1. Go to service dashboard
2. Click **"Environment"** tab
3. Edit the variable value
4. Click **"Save Changes"**
5. Service will auto-redeploy

### On Vercel:
1. Go to project settings
2. **Environment Variables** section
3. Edit value
4. Save
5. Redeploy frontend

---

## 🐛 Common Issues

### Variable Not Found
**Error:** `process.env.MONGO_URI is undefined`

**Solution:**
- Check variable name spelling (case-sensitive!)
- Ensure variable is saved in Render dashboard
- Redeploy after adding variables

### CORS Errors
**Error:** `Access-Control-Allow-Origin`

**Solution:**
- Verify `FRONTEND_URL` matches your Vercel URL exactly
- Include `https://` in the URL
- No trailing slash
- Redeploy backend after updating

### Database Connection Failed
**Error:** `MongoDB connection error`

**Solution:**
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0`)
- Ensure password in connection string is correct
- Test connection string locally first

---

## 📝 Example: Complete Setup

### Step 1: MongoDB Atlas
```
1. Create cluster
2. Create user: admin / password: SecurePass123!
3. Whitelist IP: 0.0.0.0/0
4. Get connection string:
   mongodb+srv://admin:SecurePass123!@cluster0.abc123.mongodb.net/frameit
```

### Step 2: Render Backend
```
Add variables:
MONGO_URI=mongodb+srv://admin:SecurePass123!@cluster0.abc123.mongodb.net/frameit
NODE_ENV=production
JWT_SECRET=aB3$kL9#mN2@pQ7&rS5*tU1!vW4^xY6%zA8
JWT_EXPIRE=7d
FRONTEND_URL=https://frameit-app.vercel.app
```

### Step 3: Vercel Frontend
```
Add variable:
VITE_API_URL=https://frameit-backend.onrender.com/api
```

---

## 🎯 Quick Reference

| Variable | Where | Required | Example |
|----------|-------|----------|---------|
| `MONGO_URI` | Render | ✅ Yes | `mongodb+srv://...` |
| `NODE_ENV` | Render | ✅ Yes | `production` |
| `JWT_SECRET` | Render | ✅ Yes | `your-secret-32-chars` |
| `JWT_EXPIRE` | Render | ⚠️ Optional | `7d` |
| `FRONTEND_URL` | Render | ✅ Yes | `https://app.vercel.app` |
| `API_URL` | Render | ⚠️ Optional | `https://backend.onrender.com/api` |
| `VITE_API_URL` | Vercel | ✅ Yes | `https://backend.onrender.com/api` |
| `PORT` | Render | ⚠️ Optional | `10000` |

---

## 💡 Pro Tips

1. **Use Render's Environment Groups**: Create groups for different environments (staging, production)

2. **Test Locally First**: Create a `.env` file locally with the same variables to test

3. **Document Your Variables**: Keep a secure note of what each variable does

4. **Backup Secrets**: Store secrets in a password manager (not in code!)

5. **Monitor Logs**: Check Render logs after adding variables to ensure they're loaded

---

## 📞 Need Help?

If environment variables aren't working:
1. Check variable names (case-sensitive)
2. Verify values are correct
3. Check Render/Vercel logs
4. Ensure service is redeployed after changes
5. Test with health check endpoint

---

**Remember:** Environment variables are like settings for your app. They tell your application how to connect to databases, what URLs to use, and what secrets to use for security. Without them, your app won't know how to connect to MongoDB or what frontend URL to allow!

