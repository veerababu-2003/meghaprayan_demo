# 🌦️ MeghaPrayan: Weather-Aware Smart Travel Platform

**Brand:** MeghaPrayan (*Megha* = cloud/weather, *Prayan* = journey)  
**Tagline:** Smart journeys powered by weather, routes, and real-time travel intelligence.  
**Hero Headline:** Travel Smarter. Journey Safer.

MeghaPrayan is a full-stack, motion-rich, weather-aware travel planning platform designed to eliminate hazardous driving conditions before you ever embark on your trip. It dynamically integrates road geometries from **OSRM**, localized atmospheric forecasts from **Open-Meteo**, and a custom **multi-factor Dijkstra route scoring algorithm**.

---

## 📸 Platform Screenshots

- **Hero & Landing Page (Desktop 1440px):** `screenshots/desktop_1440.png`
- **Mobile Responsive Layout (390px):** `screenshots/mobile_390.png`
- **Interactive Trip Planner:** `screenshots/plan_trip_calculated.png`
- **Trip Details & Route Comparison:** `screenshots/trip_details_desktop.png`
- **Live Trip Socket Telemetry:** `screenshots/live_trip_desktop.png`
- **Computed Traveler Profile Stats:** `screenshots/profile_desktop.png`

---

## ⚡ Key Features

1. **Weather Corridor Sampling:**
   - Samples waypoints along candidate travel paths at predicted arrival times using Open-Meteo.
   - Computes precipitation probability, road temperature extremes, humidity, and crosswind shears.

2. **Multi-Factor Dijkstra Route Scoring:**
   - Evaluates routes across a composite graph cost function:
     $$\text{Cost} = w_{\text{time}} \cdot \text{Duration} + w_{\text{distance}} \cdot \text{Distance} + w_{\text{weather}} \cdot \text{WeatherRiskPenalty}$$
   - Labels candidates as **Recommended**, **Fastest**, or **Safest**, with transparent plain-English rationales.

3. **Motion Design System (`client/src/motion`):**
   - Physics-based spring animations (`gentle`, `snappy`, `bouncy`).
   - Interactive high-performance Canvas particles that match live conditions (Rain, Clouds, Sun Shimmer, Wind Streaks).
   - Polyline path self-drawing and looping traveling vehicle markers along active routes.

4. **Voice Assistant ("Hi Veera"):**
   - Web Speech API integration with a breathing ambient orb, waveform ripples, and seamless text input fallbacks.
   - Natural voice commands: *"Weather"*, *"Plan trip to Goa"*, *"Explore"*.

5. **Live Journey Socket Telemetry:**
   - Real-time geolocation sharing via Socket.IO.
   - Dynamic distance and ETA countdowns.
   - Live atmospheric radar alerts as your GPS coordinates progress.

6. **Zero-Mock Production Integrity:**
   - Computed profile statistics derived strictly from stored database records.
   - Full JWT session management with HTTP-only cookie silent refresh and bcrypt hashing.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, GSAP, Leaflet / React-Leaflet, Lucide Icons, Socket.IO Client, Web Speech API.
- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO, Helmet, CORS, Express-Rate-Limit, Express-Mongo-Sanitize, Centralized Error Handling.
- **External Meteorological & Routing APIs:** Open-Meteo (High-resolution weather models), OSRM (Road route geometries & alternatives), Nominatim (Debounced geocoding autocomplete).

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Clone & Setup Backend
```bash
cd server
npm install
cp .env.example .env
npm start
```
*Backend runs on `http://localhost:5000` with MongoDB connection.*

### 2. Setup Frontend
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` with Vite reverse proxy.*

---

## 🧪 Testing & Verification

Run the end-to-end multi-viewport browser visual test:
```bash
node verify_ui.js
```
Runs headless browser checks across 7 viewports: `360px`, `390px`, `430px`, `768px`, `1024px`, `1440px`, and `1920px`, verifying zero console errors.

Run authenticated user journey integration tests:
```bash
node verify_auth_flow.js
```

---

## 🛡️ License & Safety Disclaimer
Road recommendations provided by MeghaPrayan represent algorithmic guidance based on real-time meteorological models and should not replace emergency alerts or driver caution.
