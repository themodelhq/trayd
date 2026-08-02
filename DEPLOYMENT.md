# ============================================================
# Tray'd - Deployment Guide
# @description Step-by-step deployment instructions
# ============================================================

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Netlify Deployment](#netlify-deployment)
3. [Render Deployment](#render-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Vercel Deployment](#vercel-deployment)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed locally
- A Git repository with your code pushed
- Environment variables ready (see `.env.example`)

### Local Build Test
```bash
npm install
npm run build
npm start
```

---

## Netlify Deployment

### Option 1: Via Netlify UI (Easiest)

1. **Push code to GitHub/GitLab/Bitbucket**

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider and select the `trayed` repository

3. **Configure build settings**
   ```
   Build command: npm run build:netlify
   Publish directory: .next
   ```

4. **Set environment variables** in Site Settings → Environment variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (generate a secure 32+ character string)
   - `NEXTAUTH_SECRET` = (generate another secure string)
   - Copy all variables from `.env.example`

5. **Deploy!** Click "Deploy site"

### Option 2: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

### Custom Domain on Netlify

1. Go to Site Settings → Domain Management
2. Add custom domain
3. Update DNS records as instructed:
   ```
   Type: CNAME
   Name: www (or your subdomain)
   Value: [your-site].netlify.app
   ```

---

## Render Deployment

### Option 1: Render Dashboard (Recommended)

1. **Create account** at [render.com](https://render.com)

2. **Create new Web Service**
   - Dashboard → New → Web Service
   - Connect your Git repository

3. **Configure settings**:
   ```
   Name: trayed-web
   Runtime: Node 20
   Build Command: npm run build:render
   Start Command: npm start
   ```

4. **Set environment variables** in the dashboard:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render's default)
   - All other vars from `.env.example`

5. **Click "Create Web Service"**

### Option 2: Using render.yaml (Blueprint)

The included `render.yaml` file allows automatic configuration:

1. Push the `render.yaml` file to your repo
2. On Render, create new Blueprint
3. Connect your repo - it will auto-configure!

### Database on Render

For production, use Render's managed PostgreSQL:

1. Create PostgreSQL service on Render
2. Copy the connection string
3. Set `DATABASE_URL` in your web service environment

---

## Docker Deployment

### Building and Running Locally

```bash
# Build the image
docker build -t trayed .

# Run container
docker run -p 3000:3000 \
  -e JWT_SECRET=your-secret \
  -e NEXTAUTH_SECRET=your-secret \
  trayed
```

### Using Docker Compose

```bash
# Development mode (SQLite)
docker-compose up -d

# Production mode (with PostgreSQL and Redis)
docker-compose --profile production up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Deploying to Cloud Providers

#### AWS ECS / Fargate
```bash
# Build and push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com
docker build -t trayed .
docker tag trayed:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/trayed:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/trayed:latest
```

#### Google Cloud Run
```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/trayed
gcloud run deploy --image gcr.io/PROJECT_ID/trayed --platform managed
```

#### Azure Container Instances
```bash
# Push to Azure Container Registry
az acr build --registry YOUR_REGISTRY --image trayed:latest .
az container create --resource-group trayed-rg --name trayed --image YOUR_REGISTRY.azurecr.io/trayed:latest
```

---

## Vercel Deployment

Since this is a Next.js app, Vercel is also an option:

1. Import project at [vercel.com/new](https://vercel.com/new)
2. Vercel auto-detects Next.js settings
3. Add environment variables in dashboard
4. Deploy!

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application mode | `production` |
| `DATABASE_URL` | Database connection | `postgresql://...` or `file:./dev.db` |
| `JWT_SECRET` | JWT signing key | Random 32+ chars |
| `NEXTAUTH_SECRET` | NextAuth secret | Random 32+ chars |
| `ZAI_SDK_API_KEY` | AI SDK key | From ZAI |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection for caching |
| `PAYSTACK_SECRET_KEY` | Payment processing |
| `SMTP_*` | Email notification settings |
| `S3_*` | File storage configuration |

See `.env.example` for complete list.

---

## Post-Deployment Checklist

After deploying, verify:

- [ ] Homepage loads correctly
- [ ] All pages navigate without errors
- [ ] API routes return proper responses (`/api/health`)
- [ ] Authentication works (login/register)
- [ ] Market data displays correctly
- [ ] Dark/Light theme toggle functions
- [ ] Mobile responsive design works
- [ ] SSL certificate is active (HTTPS)
- [ ] Custom domain resolves correctly
- [ ] Lighthouse score is acceptable (>90)

### Performance Optimization

1. Enable CDN caching for static assets
2. Configure image optimization
3. Enable gzip/brotli compression
4. Set up monitoring (Sentry, LogRocket)

### Security Checklist

- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CORS properly set
- [ ] Rate limiting enabled
- [ ] Environment variables are secrets (not in code)
- [ ] Dependencies updated regularly

---

## Troubleshooting

### Build fails on Netlify/Renders
- Check Node version compatibility (use 20.x)
- Ensure all dependencies are in package.json
- Verify Prisma schema is valid

### Runtime errors
- Check environment variables are set correctly
- Verify database connectivity
- Review deployment logs

### Blank page after deployment
- Check browser console for errors
- Verify `next.config.ts` output setting
- Ensure static files are accessible

---

## Support

For issues specific to hosting providers:
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Render**: [render.com/docs](https://render.com/docs)
- **Docker**: [docs.docker.com](https://docs.docker.com)
