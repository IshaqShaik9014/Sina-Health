# SINA — Smart Integrated Network for Healthcare Access

SINA is a full-stack, multi-organization healthcare information management platform built with React, TypeScript, Node.js, Express, and PostgreSQL (Prisma). It features strict Role-Based Access Control, cross-facility consent-based record sharing, and an Unslop-crafted clinical workstation UI.

---

## 🔑 Required Environment Keys & Configuration

To connect and deploy SINA across **Neon**, **Render**, and **Vercel**, only **one external key** is required from you:

### 1. Neon PostgreSQL (`DATABASE_URL`)
* **Where to get it**: In your [Neon.tech](https://neon.tech) project dashboard $\rightarrow$ **Connection Details** $\rightarrow$ **Direct connection** (or Pooled).
* **Format**:
  ```env
  DATABASE_URL="postgresql://<user>:<password>@<ep-xyz>.region.neon.tech/neondb?sslmode=require"
  ```
* **Where to place it**:
  * For local testing: Paste into `server/.env`
  * For cloud deployment: Set in **Render Environment Variables**

### 2. Backend Environment Variables (`server/.env` / Render)
```env
PORT=5000
NODE_ENV=development # change to "production" on Render
DATABASE_URL="<YOUR_NEON_POSTGRES_URL>"
JWT_SECRET="sina_clinical_jwt_secure_session_key_9283748291039485"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173" # change to your Vercel URL in production
```

### 3. Frontend Environment Variables (`client/.env` / Vercel)
```env
VITE_API_URL="/api/v1" # Local dev (proxied to server:5000)
# In production on Vercel, set to:
# VITE_API_URL="https://<your-render-backend-app>.onrender.com/api/v1"
```

---

## 🚀 Step-by-Step Deployment Guide

### A. Database (Neon)
1. Create a project at [Neon.tech](https://neon.tech).
2. Copy the PostgreSQL connection string.
3. Paste it into `server/.env`.
4. Run migrations and seed fictional clinical data:
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

### B. Backend Web Service (Render)
1. In [Render.com](https://render.com), click **New +** $\rightarrow$ **Web Service**.
2. Connect your Git repository.
3. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
4. Add Environment Variables:
   - `DATABASE_URL`: `<Your Neon connection string>`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `<Your secure secret>`
   - `CLIENT_URL`: `https://<your-vercel-domain>.vercel.app`

### C. Frontend (Vercel)
1. In [Vercel.com](https://vercel.com), click **Add New** $\rightarrow$ **Project**.
2. Select your Git repository.
3. Settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://<your-render-app>.onrender.com/api/v1`

---

## 👥 Demo Logins (All roles pre-configured)

Password for all accounts: `password123`

| Role | Name | Email | Facility |
| :--- | :--- | :--- | :--- |
| **Doctor (Cardiology)** | Dr. Arthur Chen | `dr.chen@sina.health` | Apex Central Hospital |
| **Doctor (Internal Med)** | Dr. Sarah Jenkins | `dr.sarah@sina.health` | Apex Central Hospital |
| **Doctor (Pulmonology)** | Dr. James Harrison | `dr.harrison@sina.health` | Metro General Hospital |
| **Community Pharmacist** | Maya Lin | `pharm.city@sina.health` | City Care Pharmacy |
| **Hospital Pharmacist** | Jonathan Wu | `pharm.apex@sina.health` | Apex Hospital Pharmacy |
| **Patient** | Robert Mercer | `patient.mercer@sina.health` | ID: `SINA-PAT-2026-000001` |
| **Hospital Admin** | Eleanor Vance | `admin.apex@sina.health` | Apex Central Hospital |
| **Super Admin** | Al-Farabi Ibn Sina | `admin@sina.health` | Platform-wide |

---

## 💻 Local Development

```bash
# 1. Start backend server (port 5000)
pnpm dev:server

# 2. Start frontend client (port 5173)
pnpm dev:client
```
