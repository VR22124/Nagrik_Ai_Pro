# Setup & Deployment Guide

## Prerequisites
* Node.js (v18 or higher)
* A Google Cloud account (for Gemini API)
* A Firebase account (for Auth and Hosting)
* Render account (optional, for backend hosting)

## Local Development Setup

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd server
   npm install
   ```
2. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and configure:
   * `GEMINI_API_KEY`: Your Google Gemini API Key.
   * `CLIENT_URL`: `http://localhost:5173`
   * `CORS_ORIGINS`: `http://localhost:5173`
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd client
   npm install
   ```
2. **Configure API URL**:
   By default, the project is configured for the **Live Production API** in `src/services/apiBase.js`.
   To test with your **local server**, update `client/src/services/apiBase.js`:
   ```javascript
   export const API_BASE_URL = "http://localhost:4000";
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:5173` in your browser.


## Firebase Configuration (Auth & Firestore)
To enable session persistence locally and in production:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new Web Project.
3. Navigate to **Authentication** -> **Sign-in method** and enable **Anonymous**.
4. Navigate to **Firestore Database** and create a database.
5. Copy the Firebase config object into `client/src/services/firebase.js`.

## Deployment Instructions

### Deploying the Backend (Render)
1. Push your repository to GitHub.
2. In Render, create a new **Web Service** tied to your repository.
3. **Build Command**: `cd server && npm install`
4. **Start Command**: `cd server && npm start`
5. **Environment Variables**: Add your `GEMINI_API_KEY` and set `NODE_ENV=production`. Set `CLIENT_URL` to your future Firebase URL.
6. Deploy and copy the Render URL (e.g., `https://nagrik-ai-pro.onrender.com`).

### Deploying the Frontend (Firebase Hosting)
1. Ensure the Firebase CLI is installed: `npm install -g firebase-tools`
2. Authenticate: `firebase login`
3. Initialize hosting in the `client/` folder: `firebase init hosting`
   * Set public directory to `dist`.
   * Configure as a single-page app: Yes.
   * Set up automatic builds: Optional.
4. Set your production API URL before building:
   ```bash
   export VITE_API_BASE_URL=https://nagrik-ai-pro.onrender.com/api
   npm run build
   ```
5. Deploy the application and security rules:
   ```bash
   firebase deploy --only hosting
   firebase deploy --only firestore:rules
   ```
