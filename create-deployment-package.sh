#!/bin/bash

# Create deployment package for Zonix Cloud
PACKAGE_NAME="zonix-cloud-deployment-$(date +%Y%m%d-%H%M%S).zip"
TEMP_DIR="/tmp/zonix-cloud-deploy"

echo "Creating deployment package: $PACKAGE_NAME"

# Create temporary directory
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR/zonix-cloud

# Copy essential files
echo "Copying essential files..."
cp -r app/ $TEMP_DIR/zonix-cloud/
cp -r components/ $TEMP_DIR/zonix-cloud/
cp -r lib/ $TEMP_DIR/zonix-cloud/
cp -r public/ $TEMP_DIR/zonix-cloud/
cp -r sql/ $TEMP_DIR/zonix-cloud/
cp -r styles/ $TEMP_DIR/zonix-cloud/

# Copy configuration files
echo "Copying configuration files..."
cp package.json $TEMP_DIR/zonix-cloud/
cp pnpm-lock.yaml $TEMP_DIR/zonix-cloud/
cp next.config.js $TEMP_DIR/zonix-cloud/
cp tsconfig.json $TEMP_DIR/zonix-cloud/
cp tailwind.config.ts $TEMP_DIR/zonix-cloud/
cp postcss.config.mjs $TEMP_DIR/zonix-cloud/

# Copy deployment configs
echo "Copying deployment configurations..."
cp wrangler.toml $TEMP_DIR/zonix-cloud/
cp .cloudflare-pages.json $TEMP_DIR/zonix-cloud/
cp .env.example $TEMP_DIR/zonix-cloud/
cp .gitignore $TEMP_DIR/zonix-cloud/

# Copy documentation and guides
echo "Copying documentation..."
cp README.md $TEMP_DIR/zonix-cloud/
cp DEPLOYMENT.md $TEMP_DIR/zonix-cloud/
cp DEPLOYMENT_CHECKLIST.md $TEMP_DIR/zonix-cloud/
cp FILE_INTERACTION_MENU.md $TEMP_DIR/zonix-cloud/
cp LICENSE $TEMP_DIR/zonix-cloud/ 2>/dev/null || true

# Copy GitHub Actions workflow
echo "Copying GitHub Actions workflow..."
mkdir -p $TEMP_DIR/zonix-cloud/.github/workflows
cp .github/workflows/deploy.yml $TEMP_DIR/zonix-cloud/.github/workflows/

# Create deployment guide at root level
cat > $TEMP_DIR/zonix-cloud/QUICK_START.md << 'QUICKSTART'
# Quick Start Guide - Zonix Cloud

## Setup Instructions (5 minutes)

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase dashboard
- `SUPABASE_SERVICE_ROLE_KEY` - From Supabase dashboard
- `RESEND_API_KEY` - From Resend dashboard
- `BLOB_READ_WRITE_TOKEN` - From Vercel Blob (optional)
- `GROQ_API_KEY` - From Groq console

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Run Locally
```bash
pnpm run dev
```
Visit http://localhost:3000

### 4. Deploy to Cloudflare Pages

**Option A: Using GitHub (Recommended)**
1. Push code to GitHub repository
2. Go to Cloudflare Pages dashboard
3. Connect your GitHub account
4. Select this repository
5. Configure build:
   - Build command: `pnpm run build`
   - Build output: `.next`
6. Add environment variables (copy from .env.local)
7. Deploy!

**Option B: Using Wrangler CLI**
```bash
npm install -g wrangler
wrangler login
wrangler pages deploy
```

**Option C: Using Docker**
```bash
docker build -t zonix-cloud .
docker run -p 3000:3000 zonix-cloud
```

## Features Included

✅ Cloud storage with encryption
✅ AI-powered file organization
✅ Team collaboration
✅ 2FA authentication
✅ File sharing with expiration
✅ Support ticket system
✅ VPS/NAS integration ready
✅ SEO optimized
✅ Mobile responsive
✅ Dark mode support

## Support

- Documentation: See DEPLOYMENT.md
- Issues: Check DEPLOYMENT_CHECKLIST.md
- Support Email: support@zonix.me
QUICKSTART

# Create .dockerignore
cat > $TEMP_DIR/zonix-cloud/.dockerignore << 'DOCKERIGNORE'
.git
.gitignore
node_modules
.next
.env*.local
coverage
.DS_Store
*.log
.wrangler
.vercel
DOCKERIGNORE

# Create Dockerfile
cat > $TEMP_DIR/zonix-cloud/Dockerfile << 'DOCKERFILE'
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy app files
COPY . .

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
DOCKERFILE

# Create docker-compose.yml
cat > $TEMP_DIR/zonix-cloud/docker-compose.yml << 'COMPOSE'
version: '3.8'

services:
  zonix-cloud:
    build: .
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      RESEND_API_KEY: ${RESEND_API_KEY}
      NEXT_PUBLIC_SITE_URL: http://localhost:3000
    env_file:
      - .env.local
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
COMPOSE

echo "✅ Successfully prepared deployment package"
echo "📦 Creating ZIP archive..."

# Create ZIP file
cd $TEMP_DIR
zip -r /vercel/share/v0-project/$PACKAGE_NAME zonix-cloud/ -q

echo "✅ Package created: $PACKAGE_NAME"
echo "📊 Package size: $(du -h /vercel/share/v0-project/$PACKAGE_NAME | cut -f1)"
echo ""
echo "📦 Contents:"
echo "  - Complete source code (app, components, lib)"
echo "  - Build configurations (Next.js, Tailwind, PostCSS)"
echo "  - Deployment configs (Wrangler, Cloudflare Pages)"
echo "  - Docker support (Dockerfile, docker-compose.yml)"
echo "  - GitHub Actions workflow"
echo "  - Documentation and guides"
echo "  - Environment template"
echo ""
echo "🚀 Ready for deployment!"

# Cleanup
rm -rf $TEMP_DIR
