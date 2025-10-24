
# Deployment Guide

Complete guide for deploying the Abetworks AI Automation Platform on various environments.

## Table of Contents
1. [Replit Deployment (Recommended)](#replit-deployment)
2. [Manual VPS/VM Deployment](#manual-vpsvm-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Replit Deployment

### Quick Deploy on Replit

Your application is already configured for Replit deployment!

#### Step 1: Configure Secrets

1. Click the lock icon 🔒 in the left sidebar (Tools → Secrets)
2. Add these environment variables:

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your_secure_random_string_minimum_32_characters
NODE_ENV=production
PYTHON_API_KEY=your_secure_api_key_for_python_agents
OPENAI_API_KEY=sk-your-openai-api-key
```

#### Step 2: Push Database Schema

Run in Shell:
```bash
npm run db:push
```

#### Step 3: Deploy

1. Click **Deploy** button (top right)
2. Choose **Reserved VM** or **Autoscale** deployment
3. Configure settings:
   - **Machine size**: 0.5 vCPU / 1 GiB RAM (minimum)
   - **Web server**: Yes
   - **Build command**: `npm run build`
   - **Run command**: Leave default (uses .replit config)

4. Click **Deploy your project**

Your app will be live at `https://your-repl-name.replit.app`

### Deployment Type Recommendations

**Use Autoscale if:**
- You expect variable traffic
- You want to pay only for actual usage
- You need automatic scaling
- You're running a public-facing application

**Use Reserved VM if:**
- You need consistent performance
- You run background tasks (Python agents)
- You want cost certainty
- You need persistent connections

---

## Manual VPS/VM Deployment

For deploying on DigitalOcean, AWS EC2, Azure, Google Cloud, or any VPS.

### Prerequisites

- Ubuntu 22.04 LTS (recommended)
- Node.js 20+
- Python 3.11+
- PostgreSQL 14+
- Nginx (for reverse proxy)
- PM2 (for process management)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11 and pip
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### Step 2: Setup Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE abetworks;
CREATE USER abetworks_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE abetworks TO abetworks_user;
\q
```

### Step 3: Clone and Setup Application

```bash
# Create app directory
sudo mkdir -p /var/www/abetworks
cd /var/www/abetworks

# Clone your repository (or upload files)
git clone https://github.com/your-repo/abetworks.git .

# Install Node.js dependencies
npm install

# Install Python dependencies
cd python-agents
python3.11 -m pip install -r requirements.txt
cd ..

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://abetworks_user:your_secure_password@localhost:5432/abetworks
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PYTHON_API_KEY=$(openssl rand -base64 32)
OPENAI_API_KEY=sk-your-openai-key
EOF

# Push database schema
npm run db:push

# Build frontend
npm run build
```

### Step 4: Configure PM2

Create PM2 ecosystem file:

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'abetworks-api',
      script: 'dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'abetworks-python-agents',
      script: 'python3.11',
      args: '-m uvicorn main:app --host 0.0.0.0 --port 8000',
      cwd: './python-agents',
      interpreter: 'none',
      env: {
        PYTHONPATH: './python-agents'
      }
    }
  ]
};
EOF
```

Start services:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 5: Configure Nginx

```bash
sudo cat > /etc/nginx/sites-available/abetworks << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (use certbot for Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Main application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Python agents API
    location /python-api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/abetworks /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Setup SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## Docker Deployment

### Dockerfile for Node.js API

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "run", "start"]
```

### Dockerfile for Python Agents

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY python-agents/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY python-agents/ .

# Expose port
EXPOSE 8000

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: abetworks
      POSTGRES_USER: abetworks
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://abetworks:${DB_PASSWORD}@postgres:5432/abetworks
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
      PYTHON_API_KEY: ${PYTHON_API_KEY}
    ports:
      - "5000:5000"
    depends_on:
      - postgres

  python-agents:
    build:
      context: .
      dockerfile: Dockerfile.python
    environment:
      DATABASE_URL: postgresql://abetworks:${DB_PASSWORD}@postgres:5432/abetworks
      PYTHON_API_KEY: ${PYTHON_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Security
JWT_SECRET=minimum_32_character_random_string
PYTHON_API_KEY=secure_api_key_for_python_service

# Application
NODE_ENV=production
PORT=5000

# AI Services (Optional)
OPENAI_API_KEY=sk-your-openai-key
```

### Generating Secure Keys

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate API key
openssl rand -hex 32
```

---

## Post-Deployment Checklist

### Security
- [ ] All environment variables set securely
- [ ] Database uses SSL connections
- [ ] Strong passwords for database
- [ ] JWT secret is random and secure (32+ characters)
- [ ] HTTPS/SSL configured
- [ ] Firewall configured (only ports 80, 443, 22 open)

### Database
- [ ] Schema pushed successfully (`npm run db:push`)
- [ ] Database backups configured
- [ ] Connection pooling enabled

### Application
- [ ] Both Node.js and Python services running
- [ ] Health checks passing
- [ ] Logs monitoring configured
- [ ] Error tracking setup (optional: Sentry)

### Testing
- [ ] Login/signup works
- [ ] API endpoints responding
- [ ] Multi-tenant isolation verified
- [ ] Python agents executable
- [ ] WebSocket connections stable (if applicable)

### Monitoring
- [ ] Application logs accessible
- [ ] Database performance monitored
- [ ] Server resources monitored (CPU, RAM, disk)
- [ ] Uptime monitoring configured

### DNS & Domain
- [ ] Domain configured correctly
- [ ] SSL certificate valid
- [ ] WWW and non-WWW both work

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs abetworks-api
pm2 logs abetworks-python-agents

# Check processes
pm2 status

# Restart services
pm2 restart all
```

### Database Connection Issues

```bash
# Test database connection
psql -h localhost -U abetworks_user -d abetworks

# Check PostgreSQL service
sudo systemctl status postgresql
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :5000
sudo lsof -i :8000

# Kill process
sudo kill -9 <PID>
```

---

## Scaling Recommendations

### Small (< 1000 users)
- 1 vCPU, 2 GB RAM
- Single instance
- Neon serverless database

### Medium (1000-10000 users)
- 2 vCPU, 4 GB RAM
- PM2 cluster mode (2-4 instances)
- Dedicated PostgreSQL server

### Large (10000+ users)
- 4+ vCPU, 8+ GB RAM
- Load balancer + multiple servers
- PostgreSQL with read replicas
- Redis for caching
- CDN for static assets

---

For more information, see:
- [Replit Deployment Docs](https://docs.replit.com/deployments)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Configuration](https://nginx.org/en/docs/)
