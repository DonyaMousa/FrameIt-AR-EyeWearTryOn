# Deployment Guide - FrameIt AR Eyewear Platform

This guide covers deploying the FrameIt application to production using Vercel (frontend) and recommended backend hosting services.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Deploy Frontend to Vercel](#deploy-frontend-to-vercel)
- [Deploy Backend](#deploy-backend)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

FrameIt consists of two main parts:

1. **Frontend** (React/Vite) - Deploy to Vercel
2. **Backend** (Node.js/Express) - Deploy to Railway, Render, or Heroku

**Recommended Setup:**

- Frontend: Vercel
- Backend: Railway or Render
- Database: MongoDB Atlas

---

## 📋 Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account
- [ ] Vercel account (free tier available)
- [ ] Railway/Render account (for backend)
- [ ] MongoDB Atlas account (free tier available)
- [ ] Domain name (optional)

---

## 🚀 Deploy Frontend to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Project**

   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**
   Add in Vercel dashboard:

   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login**

   ```bash
   vercel login
   ```

3. **Navigate to Client Directory**

   ```bash
   cd client
   ```

4. **Deploy**

   ```bash
   vercel
   ```

5. **Set Environment Variables**

   ```bash
   vercel env add VITE_API_URL
   # Enter: https://your-backend-url.com/api
   ```

6. **Production Deploy**
   ```bash
   vercel --prod
   ```

---

## 🔧 Deploy Backend

### Option 1: Railway (Recommended)

Railway is excellent for Node.js applications with MongoDB.

1. **Sign Up**

   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub

2. **Create New Project**

   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**

   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Add MongoDB**

   - Click "New" → "Database" → "MongoDB"
   - Railway will provide connection string

5. **Environment Variables**
   Add in Railway dashboard:

   ```
   MONGO_URI=<railway-mongodb-connection-string>
   PORT=5001
   NODE_ENV=production
   JWT_SECRET=<your-production-secret>
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

6. **Deploy**
   - Railway auto-deploys on push
   - Get your backend URL from Railway dashboard

### Option 2: Render

1. **Sign Up**

   - Go to [render.com](https://render.com)
   - Sign in with GitHub

2. **Create Web Service**

   - Click "New" → "Web Service"
   - Connect your GitHub repository

3. **Configure**

   - **Name**: frameit-backend
   - **Environment**: Node
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Environment Variables**
   Add the same variables as Railway

5. **Deploy**
   - Render will build and deploy
   - Get your backend URL

### Option 3: Heroku

1. **Install Heroku CLI**

   ```bash
   npm install -g heroku
   ```

2. **Login**

   ```bash
   heroku login
   ```

3. **Create App**

   ```bash
   cd backend
   heroku create frameit-backend
   ```

4. **Add MongoDB**

   ```bash
   heroku addons:create mongolab:sandbox
   ```

5. **Set Environment Variables**

   ```bash
   heroku config:set MONGO_URI=$(heroku config:get MONGOLAB_URI)
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

---

## 🔐 Environment Variables

### Frontend (Vercel)

```
VITE_API_URL=https://your-backend-url.com/api
```

### Backend (Railway/Render/Heroku)

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/frameit
PORT=5001
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend.vercel.app
API_URL=https://your-backend-url.com/api
```

---

## 📝 Post-Deployment Checklist

### 1. Update Frontend API URL

In Vercel dashboard, update:

```
VITE_API_URL=https://your-backend-url.com/api
```

### 2. Update Backend CORS

In backend environment variables:

```
FRONTEND_URL=https://your-frontend.vercel.app
```

### 3. Create Admin User

SSH into your backend or use Railway/Render console:

```bash
cd backend
npm run create-admin
```

Or use the API:

```bash
curl -X POST https://your-backend-url.com/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "secure-password",
    "name": "Admin"
  }'
```

### 4. Test Deployment

- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Admin sign-in works
- [ ] User registration works
- [ ] Products load
- [ ] AR Try-On works
- [ ] File uploads work

### 5. Set Up Custom Domain (Optional)

**Vercel:**

1. Go to project settings
2. Add domain
3. Follow DNS configuration

**Backend:**

- Railway/Render support custom domains
- Update CORS with new domain

---

## 🐛 Troubleshooting

### Frontend Issues

#### Build Fails

- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard

#### API Calls Fail

- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend URL is accessible

#### Static Files Not Loading

- Verify file paths are correct
- Check `vercel.json` configuration
- Ensure files are in `public` directory

### Backend Issues

#### MongoDB Connection Fails

- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Railway/Render)
- Ensure database user has correct permissions

#### Port Issues

- Railway/Render assign ports automatically
- Use `process.env.PORT` in server.js
- Don't hardcode port numbers

#### File Uploads Fail

- Check file size limits
- Verify Multer configuration
- Ensure storage directory exists

### Common Errors

#### CORS Errors

```
Access-Control-Allow-Origin error
```

**Solution:** Update `FRONTEND_URL` in backend environment variables

#### 404 on Routes

```
Page not found after refresh
```

**Solution:** Add rewrite rules in `vercel.json`

#### Environment Variables Not Loading

```
Undefined environment variables
```

**Solution:**

- Frontend: Variables must start with `VITE_`
- Backend: Restart service after adding variables

---

## 📊 Monitoring

### Vercel Analytics

- Enable in Vercel dashboard
- Monitor page views and performance

### Backend Logs

- **Railway**: View logs in dashboard
- **Render**: View logs in dashboard
- **Heroku**: `heroku logs --tail`

### Error Tracking

Consider adding:

- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage

---

## 🔄 Continuous Deployment

### Automatic Deployments

Both Vercel and Railway/Render support automatic deployments:

1. **Push to main branch** → Auto-deploy
2. **Pull requests** → Preview deployments (Vercel)

### Manual Deployment

```bash
# Frontend
cd client
vercel --prod

# Backend (Railway/Render auto-deploys on push)
git push origin main
```

---

## 💰 Cost Estimation

### Free Tier (Development/Small Projects)

- **Vercel**: Free (100GB bandwidth/month)
- **Railway**: $5/month free credit
- **Render**: Free tier available
- **MongoDB Atlas**: Free (512MB storage)

### Production (Recommended)

- **Vercel Pro**: $20/month
- **Railway**: Pay-as-you-go (~$5-20/month)
- **Render**: $7/month per service
- **MongoDB Atlas**: $9/month (M0 cluster)

---

## 🎯 Quick Start Commands

### Deploy Everything

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy Frontend (Vercel)
cd client
vercel --prod

# 3. Backend auto-deploys (Railway/Render)
# Just push to GitHub
```

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] MongoDB Atlas configured
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Admin user created
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] All features tested
- [ ] Error tracking set up (optional)

---

**Need Help?** Check the troubleshooting section or contact support.
