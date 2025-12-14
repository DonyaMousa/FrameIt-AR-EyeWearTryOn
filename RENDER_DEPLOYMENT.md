# Render Deployment Guide - FrameIt Backend

Complete step-by-step guide to deploy the FrameIt backend to Render.

## 📋 Prerequisites

- GitHub account
- Render account (sign up at [render.com](https://render.com))
- MongoDB Atlas account (for database)

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Code

1. **Ensure your code is on GitHub**

   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Verify backend structure**
   - Ensure `backend/package.json` has a `start` script
   - Check that `backend/src/server.js` exists
   - Verify environment variables are used (not hardcoded)

### Step 2: Sign Up / Sign In to Render

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"** or **"Sign In"**
3. Sign in with your **GitHub account** (recommended)

### Step 3: Create a New Web Service

1. **From Dashboard:**

   - Click **"New +"** button (top right)
   - Select **"Web Service"**

2. **Connect Repository:**
   - If first time: Click **"Connect GitHub"**
   - Authorize Render to access your repositories
   - Select your repository from the list
   - Click **"Connect"**

### Step 4: Configure the Web Service

Fill in the following details:

#### Basic Settings

- **Name**: `frameit-backend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend` ⚠️ **IMPORTANT**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### Environment

- **Environment**: `Node`
- **Node Version**: `18` or `20` (check your package.json)

#### Advanced Settings (Optional)

- **Auto-Deploy**: `Yes` (deploys on every push)
- **Health Check Path**: `/api/health`

### Step 5: Set Environment Variables

Click **"Environment"** tab and add these variables:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/frameit?retryWrites=true&w=majority
PORT=10000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend.vercel.app
API_URL=https://your-backend.onrender.com/api
```

**Important Notes:**

- `PORT` should be `10000` or leave empty (Render assigns automatically)
- `MONGO_URI` - Get from MongoDB Atlas
- `JWT_SECRET` - Use a strong, random string (32+ characters)
- `FRONTEND_URL` - Your Vercel frontend URL
- `API_URL` - Will be your Render service URL + `/api`

### Step 6: Create MongoDB Database (if needed)

#### Option A: Use MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allows Render to connect)
5. Get connection string
6. Replace `<password>` with your database password
7. Add to Render environment variables

#### Option B: Use Render MongoDB (Paid)

1. In Render dashboard, click **"New +"**
2. Select **"MongoDB"**
3. Configure and create
4. Render provides connection string automatically

### Step 7: Deploy

1. **Review Settings:**

   - Double-check root directory is `backend`
   - Verify start command is `npm start`
   - Confirm all environment variables are set

2. **Click "Create Web Service"**

3. **Wait for Deployment:**

   - Render will install dependencies
   - Build your application
   - Start the server
   - Usually takes 5-10 minutes

4. **Monitor Logs:**
   - Watch the build logs
   - Check for any errors
   - Verify "Your service is live" message

### Step 8: Get Your Backend URL

After deployment, Render provides:

- **Service URL**: `https://frameit-backend.onrender.com`
- **API URL**: `https://frameit-backend.onrender.com/api`

**Important:** Render free tier services spin down after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.

### Step 9: Update Frontend

Update your Vercel frontend environment variable:

```
VITE_API_URL=https://frameit-backend.onrender.com/api
```

Redeploy frontend on Vercel to apply changes.

### Step 10: Create Admin User

#### Option A: Using Render Shell

1. In Render dashboard, go to your service
2. Click **"Shell"** tab
3. Run:
   ```bash
   npm run create-admin
   ```

#### Option B: Using API

```bash
curl -X POST https://frameit-backend.onrender.com/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-secure-password",
    "name": "Admin User"
  }'
```

---

## 🔧 Configuration Details

### Render Service Settings

```
Name: frameit-backend
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

### Environment Variables Template

```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/frameit

# Server
PORT=10000
NODE_ENV=production

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=https://your-frontend.vercel.app

# API
API_URL=https://frameit-backend.onrender.com/api
```

---

## 📝 Render Dashboard Overview

### Service Dashboard

- **Logs**: View real-time logs
- **Metrics**: CPU, memory, request metrics
- **Events**: Deployment history
- **Settings**: Update configuration
- **Environment**: Manage environment variables
- **Shell**: Access command line

### Useful Features

- **Auto-Deploy**: Automatically deploys on git push
- **Manual Deploy**: Deploy specific commit
- **Rollback**: Revert to previous deployment
- **Logs**: Real-time and historical logs

---

## 🐛 Troubleshooting

### Build Fails

**Error: Module not found**

```bash
# Solution: Ensure all dependencies are in package.json
cd backend
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Error: Build command failed**

- Check `package.json` has correct scripts
- Verify Node version compatibility
- Check build logs for specific errors

### Service Won't Start

**Error: Port already in use**

- Remove hardcoded port
- Use `process.env.PORT` in server.js
- Render assigns port automatically

**Error: MongoDB connection failed**

- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0`)
- Ensure database user has correct permissions
- Test connection string locally first

### Slow Response Times

**First request is slow (30-60 seconds)**

- This is normal on Render free tier
- Service spins down after 15 min inactivity
- Consider upgrading to paid plan for always-on

**All requests are slow**

- Check MongoDB Atlas region matches Render region
- Optimize database queries
- Check service logs for errors

### CORS Errors

**Error: Access-Control-Allow-Origin**

- Verify `FRONTEND_URL` in environment variables
- Ensure it matches your Vercel URL exactly
- Check backend CORS configuration
- Restart service after updating environment variables

### File Upload Issues

**Error: File too large**

- Render has file size limits
- Consider using cloud storage (AWS S3, Cloudinary)
- Or increase file size limit in Multer config

**Error: Cannot write file**

- Render file system is ephemeral
- Files may be lost on restart
- Use external storage for production

---

## 🔄 Updating Your Deployment

### Automatic Updates

Render auto-deploys when you push to the connected branch:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render will automatically:

1. Detect the push
2. Start new build
3. Deploy new version
4. Switch traffic to new version

### Manual Deploy

1. Go to Render dashboard
2. Click on your service
3. Click **"Manual Deploy"**
4. Select branch and commit
5. Click **"Deploy"**

### Rollback

1. Go to **"Events"** tab
2. Find previous successful deployment
3. Click **"Redeploy"**

---

## 💰 Render Pricing

### Free Tier

- **Web Services**: Free (with limitations)
- **Spins down** after 15 min inactivity
- **512 MB RAM**
- **0.1 CPU**
- **100 GB bandwidth/month**

### Paid Plans

- **Starter**: $7/month per service

  - Always on (no spin down)
  - 512 MB RAM
  - Better performance

- **Standard**: $25/month per service
  - 2 GB RAM
  - Better for production

---

## ✅ Post-Deployment Checklist

- [ ] Service is running and accessible
- [ ] Health check endpoint works: `/api/health`
- [ ] Environment variables are set correctly
- [ ] MongoDB connection is working
- [ ] CORS is configured correctly
- [ ] Admin user created
- [ ] Frontend updated with backend URL
- [ ] Test API endpoints
- [ ] Test file uploads
- [ ] Monitor logs for errors

---

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Render Status Page](https://status.render.com)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [Render Community](https://community.render.com/)

---

## 📞 Support

If you encounter issues:

1. Check Render logs in dashboard
2. Verify environment variables
3. Test MongoDB connection
4. Check Render status page
5. Review troubleshooting section above

---

**Your backend will be live at:** `https://your-service-name.onrender.com`

**API base URL:** `https://your-service-name.onrender.com/api`
