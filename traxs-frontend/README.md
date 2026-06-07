# TRAXS Frontend

Lagos urban mobility intelligence dashboard — React + Vite single-page application that visualises live bus network data, route analytics, and USSD-based driver simulation.

---

## Tech Stack

| Layer         | Library / Tool                  |
| ------------- | ------------------------------- |
| Framework     | React 19 + Vite 8               |
| Routing       | react-router-dom v7             |
| State         | Zustand v5                      |
| Maps          | react-leaflet v5 + Leaflet 1.9  |
| Charts        | Recharts v3                     |
| Realtime      | Native WebSocket (API Gateway)  |
| Styling       | Inline styles + Tailwind CSS v4 |
| Notifications | react-hot-toast                 |
| Icons         | lucide-react                    |

---

## Project Structure

```
traxs-frontend/
├── src/
│   ├── App.jsx                  # Router, Toaster, useSocket bootstrap
│   ├── main.jsx                 # Vite entry point
│   ├── pages/
│   │   ├── LandingPage.jsx      # Marketing landing with live WAT clock
│   │   ├── LiveMap.jsx          # Animated city intelligence map
│   │   ├── Planner.jsx          # Route Intelligence (urban planners)
│   │   ├── Investor.jsx         # Corridor Analytics (investors)
│   │   ├── Government.jsx       # City Health & policy simulation
│   │   └── Simulator.jsx        # USSD phone simulator + driver dashboard
│   ├── components/
│   │   ├── Sidebar.jsx          # Collapsible nav with live WAT clock
│   │   ├── USSDSimulator.jsx    # Phone UI for driver USSD flow
│   │   ├── DriverDashboard.jsx  # Live telemetry panel (cell tower, journey stats)
│   │   └── shared/
│   │       ├── MetricCard.jsx
│   │       ├── InsightCallout.jsx
│   │       ├── CorridorBadge.jsx
│   │       ├── LiveBadge.jsx
│   │       └── LoadingState.jsx
│   ├── store/
│   │   └── useStore.js          # Zustand store (drivers, vehicles, events, sim)
│   ├── hooks/
│   │   ├── useSocket.js         # WebSocket connection & live data management
│   │   └── useApi.js            # Generic fetch helper
│   └── data/
│       └── mockData.js          # Seed dataset for pre-populated Lagos corridors
├── .env                         # Environment variables (see below)
├── index.html
├── vite.config.js
└── package.json
```

---

## Environment Setup

Create a `.env` file in `traxs-frontend/`:

```env
VITE_API_BASE_URL=https://your-api-gateway-id.execute-api.eu-west-1.amazonaws.com/dev
VITE_WEBSOCKET_URL=wss://your-ws-api-gateway-id.execute-api.eu-west-1.amazonaws.com/dev
```

- **`VITE_API_BASE_URL`** — HTTPS REST base URL for all Lambda endpoints.
- **`VITE_WEBSOCKET_URL`** — WSS URL for the API Gateway WebSocket stage.

---

## Running Locally

```bash
cd traxs-frontend
npm install
npm run dev
```

The dev server starts on `http://localhost:5173` by default.

Other scripts:

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build locally
npm run lint      # ESLint
```

---

## Pages

### `/` — Landing Page

Marketing entry point. Shows a live **WAT (West Africa Time) clock** in the navbar. The "Open Dashboard" button navigates to `/map`.

### `/map` — Live Network

The main operational view. An animated Leaflet map of Lagos rendered with seven live layers:

- **Moving bus markers** — 11 demo entities (drivers + inferred vehicles) that interpolate smoothly between waypoints using `requestAnimationFrame`. Each marker rotates to its current bearing.
- **Route trail lines** — short fading polylines that follow each vehicle.
- **Passenger dot rain** — animated dots falling across the city representing boarding events.
- **Ghost corridor pulse** — pulsing overlays on underserved corridors.
- **Congestion heatmap** — colour-coded circles that breathe intensity over time.
- **Route event pulse markers** — point markers for active incidents.
- **Motor park density circles** — rings around the 5 major Lagos motor parks scaled by activity.

The bottom-left info panel shows a live WAT clock, network statistics, and a velocity sparkline. Layer toggles in the top-right control visibility without triggering re-renders.

### `/planner` — Route Intelligence

For urban planners. Fetches from `/api/intelligence/planner/overview` and `/api/inference/events`. Shows:

- Ghost corridor list with supply/demand scores and HIGH PRIORITY flags
- Active route events feed
- Top corridors by movement volume (bar chart)
- 24-hour movement trend (line chart)

### `/investor` — Corridor Analytics

For investors. Fetches from `/api/intelligence/investor/routes`. Shows:

- Route viability table (sortable by viability score)
- Revenue potential by corridor (horizontal bar chart)
- Demand vs Supply scatter plot — corridors in the top-left quadrant (high demand, low supply) are highlighted red as investment opportunities

### `/government` — City Health

For government users. Fetches city health metrics and LGA breakdown. Features a policy simulation tool — select a policy type (e.g. "Ban Okada in Zone") and see the estimated passengers disrupted, wards affected, risk level, and alternative coverage analysis.

### `/simulator` — USSD Simulation

Two-column layout:

- **Left**: USSD phone simulator. A driver selects a route via a scrollable dial interface and registers via the `*348*1#` USSD flow.
- **Right**: Driver Dashboard — live telemetry panel that activates when a driver starts a simulation. Shows cell tower triangulation (SVG with animated signal dots), live journey stats (speed, passengers, airtime, progress), and a terminal-style event log.

---

## State Management (Zustand)

`useStore.js` holds all shared runtime state:

| Key                | Default | Description                                  |
| ------------------ | ------- | -------------------------------------------- |
| `drivers`          | `[]`    | Active drivers received from WebSocket / API |
| `inferredVehicles` | `[]`    | AI-inferred vehicles                         |
| `routeEvents`      | `[]`    | Active route incidents                       |
| `passengerCount`   | `0`     | Running total of passenger boarding events   |
| `connected`        | `false` | WebSocket connection status                  |
| `activeSimDriver`  | `null`  | Current USSD simulation driver object        |

The `activeSimDriver` object is populated by `startDriverSimulation(routeLabel, waypoints)` and updated every 3 seconds with position, speed, passengers boarded, airtime balance, and event log entries. It is cleared by `stopDriverSimulation()`.

---

## WebSocket

`useSocket.js` runs once at app startup (inside `AppInner` in `App.jsx`) and manages the connection lifecycle. On open it fetches initial state from three REST endpoints in parallel, then keeps data live via push events over the socket.

WebSocket events handled:

| Event                    | Action                                         |
| ------------------------ | ---------------------------------------------- |
| `driver:location_update` | Updates driver lat/lng and current route       |
| `vehicle:inferred`       | Upserts an inferred vehicle                    |
| `event:new_report`       | Prepends a route event and shows a toast alert |
| `passenger:event`        | Increments the passenger counter               |
| `snapshot:updated`       | Toasts a ghost corridor alert when flagged     |

Auto-reconnect fires after 5 seconds on unexpected disconnection.

---

## USSD Simulation Flow

1. User opens `/simulator` and selects a route on the phone dial.
2. Pressing **CALL** opens the USSD session (`*347#`).
3. The driver navigates the menu: Register → Choose route → Confirm.
4. On confirmation, `startDriverSimulation(routeLabel, waypoints)` is called in Zustand.
5. The Driver Dashboard on the right activates, showing:
   - Cell tower triangulation with animated signal dots and ping counter
   - Live stats: speed, passengers boarded, airtime balance, progress bar
   - Terminal event log with Lagos-timezone timestamps
6. Every waypoint transition is logged. **JOURNEY COMPLETE** fires when all waypoints are visited.
7. The user can press **END** to stop the simulation early.

---

## WAT Clock

A live West Africa Time clock (`Africa/Lagos` timezone) appears in three places:

- Sidebar collapse bar (when expanded)
- Landing page navbar
- Live Network info panel (bottom-left)

All three use `toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', hour12: false })` updated on a 1-second interval.
