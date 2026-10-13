# 🚀 MeghaPrayan Deployment Guide

MeghaPrayan is engineered with a modular modern architecture: a React + Vite Single Page Application on the frontend and an Express + Socket.IO + MongoDB service on the backend.

---

## 1. Backend Deployment (Render / Railway / AWS EC2)

### Option A: Render (Recommended Web Service)
1. Link your Git repository on Render.
2. Create a new **Web Service**.
3. Set the Root Directory to `server`.
4. Configure the build and start commands:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Configure Environment Variables in the Render Dashboard:
   - `PORT`: `5000` (or leave default, Render sets `PORT` automatically)
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-meghaprayan-frontend.vercel.app`
   - `MONGO_URI`: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/meghaprayan?retryWrites=true&w=majority`
   - `JWT_ACCESS_SECRET`: `<64-character-random-hex-string>`
   - `JWT_REFRESH_SECRET`: `<64-character-random-hex-string>`
   - `JWT_ACCESS_EXPIRES`: `15m`
   - `JWT_REFRESH_EXPIRES`: `7d`
   - `USE_MOCKS`: `false`

---

## 2. Frontend Deployment (Vercel / Netlify)

### Option A: Vercel (Recommended)
1. Import repository into Vercel.
2. Select Root Directory as `client`.
3. Framework Preset: **Vite**.
4. Configure Build & Output:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Set rewrites in `client/vercel.json` for SPA routing:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-server.onrender.com/api/$1" },
    { "source": "/socket.io/(.*)", "destination": "https://your-server.onrender.com/socket.io/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 3. Database Deployment (MongoDB Atlas)
1. Create a free M0 tier cluster in your target region.
2. Under **Network Access**, add `0.0.0.0/0` (or your Render outgoing IP range).
3. Under **Database Access**, create a user with `readWriteAnyDatabase` privileges.
4. Obtain the connection string and set as `MONGO_URI`.
