# TRAXS Backend — AWS Serverless Architecture

TRAXS (Transport Real-time Analytics & Crowd-sourced Signals) is a mobility intelligence platform for Lagos' informal transport network — danfos, kekes, and okadas. This backend is fully serverless, running entirely on AWS with no persistent server process.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [AWS Services Used](#aws-services-used)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Installation](#installation)
- [Deployment](#deployment)
- [Seeding the Database](#seeding-the-database)
- [API Reference](#api-reference)
- [WebSocket Events](#websocket-events)
- [DynamoDB Table Schemas](#dynamodb-table-schemas)
- [Data Flow](#data-flow)
- [Crowd Inference Algorithm](#crowd-inference-algorithm)
- [Bedrock Intelligence (Ask TRAXS)](#bedrock-intelligence-ask-traxs)
- [USSD Integration](#ussd-integration)
- [IAM Permissions Required](#iam-permissions-required)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
Frontend (React / Vercel)
          │
          ▼
┌─────────────────────────────────────────┐
│         API Gateway (HTTP REST)         │  ← All REST endpoints
│         API Gateway (WebSocket)         │  ← Real-time push to clients
└───────────────┬─────────────────────────┘
                │
         Lambda Functions (Node.js 18)
                │
    ┌───────────┼────────────────┐
    ▼           ▼                ▼
DynamoDB      S3 Bucket       SNS Topic
(6 tables)  (raw archive)   (route alerts)
                │
        ┌───────┼──────────┐
        ▼                  ▼
  Kinesis Stream      EventBridge
(passenger events)  (5-min schedule)
        │                  │
        ▼                  ▼
 Crowd Inference      Mobility Snapshot
    Lambda               Lambda
        │
        ▼
  Amazon Bedrock
  (Claude Haiku)
```

Every HTTP request from the frontend hits **API Gateway**, which routes it to the correct **Lambda function**. Lambda reads and writes to **DynamoDB**. All raw events are archived to **S3** before processing. Route alerts are published to **SNS**. Passenger events flow through **Kinesis** into the crowd inference Lambda. The mobility snapshot Lambda is triggered by **EventBridge** every 5 minutes. Real-time updates are broadcast back to the frontend through **API Gateway WebSockets**. Natural language questions are answered by **Amazon Bedrock (Claude)** using live DynamoDB context.

---

## AWS Services Used

| Service | Purpose |
|---|---|
| **API Gateway (HTTP)** | Routes all REST API requests to Lambda functions |
| **API Gateway (WebSocket)** | Real-time bidirectional connection with frontend clients |
| **AWS Lambda** | Executes all application logic — 22 functions total |
| **Amazon DynamoDB** | Primary database — 6 tables, on-demand billing |
| **Amazon S3** | Raw event archive — every incoming event stored as JSON |
| **Amazon SNS** | Route alert broadcasting — published on every driver report |
| **Amazon Kinesis** | Passenger event stream — decouples ingestion from inference |
| **Amazon EventBridge** | Triggers the mobility snapshot Lambda every 5 minutes |
| **Amazon Bedrock (Claude Haiku)** | Natural language answers grounded in live mobility data |
| **AWS CloudFormation** | Serverless Framework uses this to provision all infrastructure |
| **Amazon CloudWatch** | Automatic Lambda log aggregation |

**Region:** `us-east-1` (all services)

---

## Prerequisites

Before deploying, ensure you have the following installed:

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18.x | [nodejs.org](https://nodejs.org) |
| Serverless Framework | ≥ 3.x | `npm install -g serverless` |
| AWS CLI (optional but recommended) | ≥ 2.x | [aws.amazon.com/cli](https://aws.amazon.com/cli) |

You also need an **AWS account** with an IAM user that has `AdministratorAccess` (or the specific policies listed in [IAM Permissions Required](#iam-permissions-required)).

---

## Project Structure

```
traxs-backend/
├── serverless.yml                    # Infrastructure definition — all AWS resources
├── package.json
├── .env                              # Local environment variables (never commit)
├── .gitignore
│
└── src/
    ├── config/
    │   ├── aws.js                    # Singleton AWS SDK client instances
    │   └── env.js                    # Centralised environment variable access
    │
    ├── handlers/                     # Lambda function entry points
    │   ├── health.js                 # GET /health
    │   ├── drivers/
    │   │   ├── activate.js           # POST /api/drivers/activate
    │   │   ├── location.js           # POST /api/drivers/location
    │   │   ├── report.js             # POST /api/drivers/report
    │   │   ├── endSession.js         # POST /api/drivers/end-session
    │   │   └── getActive.js          # GET  /api/drivers/active
    │   ├── passengers/
    │   │   └── event.js              # POST /api/passengers/event
    │   ├── inference/
    │   │   ├── vehicles.js           # GET  /api/inference/vehicles
    │   │   ├── corridors.js          # GET  /api/inference/corridors
    │   │   ├── ghostCorridors.js     # GET  /api/inference/ghost-corridors
    │   │   └── events.js             # GET  /api/inference/events
    │   ├── intelligence/
    │   │   ├── plannerOverview.js    # GET  /api/intelligence/planner/overview
    │   │   ├── investorRoutes.js     # GET  /api/intelligence/investor/routes
    │   │   ├── cityHealth.js         # GET  /api/intelligence/government/city-health
    │   │   ├── simulatePolicy.js     # POST /api/intelligence/government/simulate-policy
    │   │   └── ask.js                # POST /api/intelligence/ask  (Bedrock)
    │   ├── ussd/
    │   │   └── webhook.js            # POST /api/ussd  (Africa's Talking)
    │   ├── websocket/
    │   │   ├── connect.js            # $connect route
    │   │   ├── disconnect.js         # $disconnect route
    │   │   └── default.js            # $default route
    │   ├── kinesis/
    │   │   └── processPassengerEvent.js  # Kinesis stream consumer
    │   └── eventbridge/
    │       └── mobilitySnapshot.js   # EventBridge 5-minute trigger
    │
    ├── models/                       # DynamoDB data access layer
    │   ├── Driver.js
    │   ├── PassengerEvent.js
    │   ├── RouteEvent.js
    │   ├── MobilitySnapshot.js
    │   ├── InferredVehicle.js
    │   └── WebSocketConnection.js
    │
    ├── services/
    │   ├── crowdInference.js         # Spatial clustering algorithm
    │   ├── mobilitySnapshot.js       # 5-minute corridor snapshot logic
    │   └── airtimeReward.js          # Driver airtime incentive system
    │
    ├── utils/
    │   ├── response.js               # Lambda HTTP response helpers
    │   └── websocket.js              # Broadcast helper for WebSocket push
    │
    └── seed.js                       # Populates DynamoDB with demo data
```

---

## Environment Configuration

Copy the `.env` file and fill in your values. **Never commit this file to version control.**

```env
# ── AWS Credentials ────────────────────────────────────────────────────────────
# IAM → Users → your user → Security credentials → Create access key
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
AWS_REGION=us-east-1

# ── DynamoDB Table Names ───────────────────────────────────────────────────────
# Auto-created by serverless deploy — these names match serverless.yml exactly
DRIVERS_TABLE=traxs-backend-drivers-dev
PASSENGER_EVENTS_TABLE=traxs-backend-passenger-events-dev
ROUTE_EVENTS_TABLE=traxs-backend-route-events-dev
MOBILITY_SNAPSHOTS_TABLE=traxs-backend-mobility-snapshots-dev
INFERRED_VEHICLES_TABLE=traxs-backend-inferred-vehicles-dev
WEBSOCKET_CONNECTIONS_TABLE=traxs-backend-ws-connections-dev

# ── S3 ─────────────────────────────────────────────────────────────────────────
S3_RAW_BUCKET=traxs-backend-raw-events-dev

# ── SNS ────────────────────────────────────────────────────────────────────────
# Copied from deploy output → RouteAlertsTopicArn
SNS_ROUTE_ALERTS_TOPIC=arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:traxs-backend-route-alerts-dev

# ── Kinesis ────────────────────────────────────────────────────────────────────
KINESIS_PASSENGER_STREAM=traxs-backend-passenger-events-dev

# ── API Gateway WebSocket ──────────────────────────────────────────────────────
# Copied from deploy output → WebSocketApiUrl (replace wss:// with https://)
WEBSOCKET_API_ENDPOINT=https://YOUR_WS_API_ID.execute-api.us-east-1.amazonaws.com/dev

# ── Bedrock ────────────────────────────────────────────────────────────────────
# Must enable this model in AWS Console → Bedrock → Model access
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# ── Client ─────────────────────────────────────────────────────────────────────
CLIENT_URL=http://localhost:5173

# ── Africa's Talking (optional) ────────────────────────────────────────────────
AFRICAS_TALKING_API_KEY=
AFRICAS_TALKING_USERNAME=sandbox
```

> **Note:** `SNS_ROUTE_ALERTS_TOPIC` and `WEBSOCKET_API_ENDPOINT` are only available after the first `serverless deploy`. Copy them from the deploy output and update your `.env`.

---

## Installation

**1. Install dependencies**

```bash
cd traxs-backend
npm install
```

**2. Install Serverless Framework globally**

```bash
npm install -g serverless
```

**3. Configure AWS credentials**

The recommended approach is to configure credentials permanently using the AWS CLI:

```bash
aws configure
# Enter your Access Key ID, Secret Access Key, region (us-east-1), output format (json)
```

Alternatively, set credentials for the current terminal session (Windows PowerShell):

```powershell
$env:AWS_ACCESS_KEY_ID="YOUR_KEY"
$env:AWS_SECRET_ACCESS_KEY="YOUR_SECRET"
$env:AWS_REGION="us-east-1"
```

**4. Enable Bedrock model access** *(one-time, required for the Ask TRAXS endpoint)*

AWS Console → **Amazon Bedrock** → **Model access** → **Manage model access** → enable **Claude 3 Haiku** → Save

---

## Deployment

### Deploy to AWS

```bash
# Deploy to dev stage (default)
serverless deploy --stage dev

# Deploy to production stage
serverless deploy --stage prod
```

The first deploy takes approximately 3–5 minutes. At completion you will see output similar to:

```
✔ Service deployed to stack traxs-backend-dev

endpoints:
  GET  - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/health
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/api/drivers/activate
  ...
  wss://yyyyyyyyyy.execute-api.us-east-1.amazonaws.com/dev

Stack Outputs:
  HttpApiUrl:           https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
  WebSocketApiUrl:      wss://yyyyyyyyyy.execute-api.us-east-1.amazonaws.com/dev
  RouteAlertsTopicArn:  arn:aws:sns:us-east-1:ACCOUNT_ID:traxs-backend-route-alerts-dev
```

After deploy, copy the following values into your `.env`:
- `WebSocketApiUrl` → `WEBSOCKET_API_ENDPOINT` (change `wss://` to `https://`)
- `RouteAlertsTopicArn` → `SNS_ROUTE_ALERTS_TOPIC`

### Useful deployment commands

```bash
# View logs for a specific function
serverless logs -f driversActivate --stage dev

# Tail logs in real time
serverless logs -f kinesisProcessPassengerEvent --tail --stage dev

# Remove all deployed resources
serverless remove --stage dev

# Redeploy a single function (faster than full deploy)
serverless deploy function -f driversActivate --stage dev
```

---

## Seeding the Database

Populate all DynamoDB tables with realistic Lagos demo data:

```bash
npm run seed
```

The seed script creates:
- **10 active drivers** across 5 Lagos corridors (mix of danfo, keke, okada)
- **200 passenger events** spread across corridors from the last hour
- **5 inferred vehicles** linked to seed drivers
- **2 active route events** (road block, police checkpoint)
- **125 mobility snapshots** covering the last 2 hours at 5-minute intervals, with 2 ghost corridors pre-configured

> The seed script reads the same `.env` file and writes directly to the deployed DynamoDB tables. Ensure your AWS credentials are set before running it.

---

## API Reference

**Base URL:** `https://{api-id}.execute-api.us-east-1.amazonaws.com/dev`

All successful responses follow this envelope:
```json
{ "success": true, "data": { ... } }
```

All error responses:
```json
{ "success": false, "error": "Error message" }
```

---

### Health

#### `GET /health`
Returns server status.

**Response**
```json
{ "success": true, "data": { "status": "TRAXS backend running on AWS Lambda" } }
```

---

### Drivers

#### `POST /api/drivers/activate`
Activates a driver session. Creates a new driver if the phone number is not found, otherwise reactivates the existing driver.

**Request body**
```json
{
  "phoneNumber": "08012345678",
  "deviceType": "smartphone",
  "vehicleType": "danfo",
  "homePark": "Oshodi"
}
```

| Field | Type | Values |
|---|---|---|
| `phoneNumber` | string | Any valid Nigerian phone number |
| `deviceType` | string | `smartphone`, `feature_phone` |
| `vehicleType` | string | `danfo`, `keke`, `okada` |
| `homePark` | string | Driver's home motor park |

**Response**
```json
{ "success": true, "data": { "driverId": "DRV-345678-K7X2P" } }
```

**Side effects:** Archives raw payload to S3. Awards ₦50 airtime to driver.

---

#### `POST /api/drivers/location`
Updates a driver's current GPS coordinates. Triggers a real-time WebSocket broadcast to all connected clients.

**Request body**
```json
{
  "driverId": "DRV-345678-K7X2P",
  "lat": 6.5568,
  "lng": 3.3488
}
```

**Response**
```json
{ "success": true, "data": { "driverId": "DRV-345678-K7X2P", "lat": 6.5568, "lng": 3.3488 } }
```

**Side effects:** Archives to S3. Broadcasts `driver:location_update` via WebSocket.

---

#### `POST /api/drivers/report`
Submits a road event report from a driver. Triggers an SNS alert and WebSocket broadcast.

**Request body**
```json
{
  "driverId": "DRV-345678-K7X2P",
  "eventType": "road_blocked",
  "lat": 6.5601,
  "lng": 3.3555,
  "description": "Accident blocking two lanes near Oshodi bridge"
}
```

| `eventType` values |
|---|
| `road_blocked` |
| `police_checkpoint` |
| `flooding` |
| `accident` |
| `long_queue` |

**Response**
```json
{
  "success": true,
  "data": {
    "eventId": "uuid",
    "driverId": "DRV-345678-K7X2P",
    "eventType": "road_blocked",
    "location": { "type": "Point", "coordinates": [3.3555, 6.5601] },
    "description": "...",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "isActive": true
  }
}
```

**Side effects:** Archives to S3. Publishes to SNS topic. Broadcasts `event:new_report` via WebSocket. Awards ₦50 airtime to driver.

---

#### `POST /api/drivers/end-session`
Ends a driver's active session.

**Request body**
```json
{ "driverId": "DRV-345678-K7X2P" }
```

**Response**
```json
{
  "success": true,
  "data": { "tripsToday": 7, "earningsToday": 14000, "airtimeEarned": 350 }
}
```

---

#### `GET /api/drivers/active`
Returns all currently active drivers with their locations and routes.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "driverId": "DRV-345678-K7X2P",
      "vehicleType": "danfo",
      "currentLocation": { "type": "Point", "coordinates": [3.3488, 6.5568] },
      "currentRoute": "oshodi-ikeja",
      "homepark": "Oshodi"
    }
  ]
}
```

---

### Passengers

#### `POST /api/passengers/event`
Records a passenger movement event from a device. Publishes the event to Kinesis for asynchronous crowd inference processing.

**Request body**
```json
{
  "deviceId": "DEVICE-0042",
  "lat": 6.5568,
  "lng": 3.3488,
  "speed": 24.5,
  "heading": 320,
  "motionType": "bus"
}
```

| `motionType` values |
|---|
| `walking` |
| `bus` |
| `motorcycle` |
| `stationary` |

**Response**
```json
{ "success": true, "data": { "eventId": "uuid" } }
```

**Side effects:** Archives to S3. Publishes to Kinesis stream. Broadcasts `passenger:event` via WebSocket.

---

### Inference

#### `GET /api/inference/vehicles`
Returns all currently active inferred vehicles detected by crowd inference.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "vehicleId": "uuid",
      "linkedDriverId": "DRV-345678-K7X2P",
      "estimatedOccupancy": 14,
      "currentLocation": { "type": "Point", "coordinates": [3.3488, 6.5568] },
      "assignedRoute": "oshodi-ikeja",
      "status": "active",
      "passengerDeviceIds": ["DEVICE-0001", "..."],
      "lastUpdated": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

---

#### `GET /api/inference/corridors`
Returns all mobility snapshots from the last 24 hours, grouped by corridor ID.

**Response**
```json
{
  "success": true,
  "data": {
    "oshodi-ikeja": [ { "corridorId": "oshodi-ikeja", "demandScore": 82, "supplyScore": 45, ... } ],
    "cms-lekki": [ ... ]
  }
}
```

---

#### `GET /api/inference/ghost-corridors`
Returns corridors where demand significantly exceeds supply (demandScore > 70 AND supplyScore < 30). Returns the latest snapshot per corridor from the last 24 hours.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "corridorId": "ikorodu-cbd",
      "corridorName": "Ikorodu–CBD",
      "demandScore": 89,
      "supplyScore": 12,
      "ghostCorridor": true,
      "passengerMovements": 180
    }
  ]
}
```

---

#### `GET /api/inference/events`
Returns all active route events from the last 6 hours, sorted by most recent.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "eventId": "uuid",
      "driverId": "DRV-345678-K7X2P",
      "eventType": "road_blocked",
      "location": { "type": "Point", "coordinates": [3.3555, 6.5601] },
      "description": "...",
      "timestamp": "2024-01-01T10:00:00.000Z",
      "isActive": true
    }
  ]
}
```

---

### Intelligence

#### `GET /api/intelligence/planner/overview`
Returns a comprehensive overview for urban planners — ghost corridors, congestion hotspots, vehicle distribution, and corridor heatmap data.

**Response**
```json
{
  "success": true,
  "data": {
    "ghostCorridors": [ { "corridorId": "...", "demandScore": 89, "supplyScore": 12, ... } ],
    "congestionHotspots": [ { "eventType": "road_blocked", "severity": "road_blocked", ... } ],
    "vehiclesByZone": [ { "_id": "oshodi-ikeja", "count": 3 } ],
    "heatmapData": [ { "corridorId": "...", "corridorName": "...", "demandScore": 82, "passengerMovements": 150 } ]
  }
}
```

---

#### `GET /api/intelligence/investor/routes`
Returns route viability analysis for investors, sorted by viability score descending.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "corridorId": "ikorodu-cbd",
      "corridorName": "Ikorodu–CBD",
      "loadFactor": 88,
      "averageOccupancy": 16,
      "demandScore": 89,
      "supplyScore": 12,
      "estimatedRevenuePotentialKPerDay": 8,
      "viabilityScore": 94
    }
  ]
}
```

---

#### `GET /api/intelligence/government/city-health`
Returns city-wide mobility health metrics for government and policy dashboards.

**Response**
```json
{
  "success": true,
  "data": {
    "mobilityHealthScore": 64,
    "activeDrivers": 10,
    "activeVehicles": 5,
    "lgaBreakdown": [
      { "lga": "Lagos Island", "activeVehicles": 0, "transitScore": 48 }
    ],
    "equityIndex": [
      { "lga": "Ikorodu", "activeVehicles": 0, "transitScore": 32, "flag": "poor_transit_access" }
    ]
  }
}
```

---

#### `POST /api/intelligence/government/simulate-policy`
Simulates the impact of a transport policy on Lagos mobility.

**Request body**
```json
{
  "type": "ban_okada",
  "zone": "Lagos Island"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "policy": { "type": "ban_okada", "zone": "Lagos Island" },
    "estimatedPassengersDisrupted": 24000,
    "affectedWards": ["Lagos Island", "Lagos Island North", "Lagos Island South"],
    "alternativeCoverageAvailable": "Limited — danfo coverage partial",
    "riskLevel": "High",
    "recommendation": "Consider phased implementation in Lagos Island with alternative transport augmentation."
  }
}
```

---

#### `POST /api/intelligence/ask`
Sends a natural language question to Amazon Bedrock (Claude Haiku), grounded in live mobility data pulled from DynamoDB at request time.

**Request body**
```json
{ "question": "Which corridor has the highest unmet demand right now?" }
```

**Response**
```json
{
  "success": true,
  "data": {
    "answer": "Based on current TRAXS data, the Ikorodu–CBD corridor has the highest unmet demand...",
    "mobilityContext": "TRAXS Lagos Mobility Intelligence — Current Snapshot..."
  }
}
```

> Requires Bedrock Claude 3 Haiku to be enabled in your AWS account.

---

### USSD

#### `POST /api/ussd`
Africa's Talking USSD webhook endpoint. Handles the full USSD session state machine for feature phone drivers.

**Content-Type:** `application/x-www-form-urlencoded`

**Request fields** (sent by Africa's Talking platform)

| Field | Description |
|---|---|
| `sessionId` | Unique session identifier |
| `serviceCode` | USSD short code (e.g. `*384*57911#`) |
| `phoneNumber` | Caller's phone number |
| `text` | Accumulated menu selections joined by `*` |

**Menu flow:**
```
Welcome to TRAXS
1. Start Trip       → activates driver, awards ₦50 airtime
2. Report Issue     → sub-menu: Road Blocked / Checkpoint / Accident / Flooding / Long Queue
3. My Earnings Today → shows trips, cash earnings, airtime earned
4. End Trip         → deactivates driver, shows session summary
```

**Response:** Plain text with `CON` prefix (continue session) or `END` prefix (terminate session).

---

## WebSocket Events

Connect to the WebSocket endpoint using the native browser `WebSocket` API:

```javascript
const ws = new WebSocket('wss://YOUR_WS_API_ID.execute-api.us-east-1.amazonaws.com/dev');
```

All messages are JSON in the format:
```json
{ "event": "event_name", "data": { ... } }
```

### Events emitted by the server

| Event | Trigger | Payload |
|---|---|---|
| `driver:location_update` | Driver posts a location update | `{ driverId, lat, lng, route }` |
| `event:new_report` | Driver submits a route report | `{ eventType, lat, lng, description, timestamp }` |
| `passenger:event` | A passenger event is received | `{ deviceId, lat, lng, motionType }` |
| `vehicle:inferred` | Crowd inference detects a vehicle | `{ vehicleId, lat, lng, occupancy, route, linkedDriver }` |
| `snapshot:updated` | EventBridge triggers a mobility snapshot | `{ corridorId, loadFactor, demandScore, ghostCorridor }` |

### Connection lifecycle

- **`$connect`** — Stores `connectionId` in DynamoDB (`traxs-backend-ws-connections-dev`) with a 24-hour TTL
- **`$disconnect`** — Removes `connectionId` from DynamoDB
- Stale connections (410 Gone) are automatically cleaned up during the next broadcast

---

## DynamoDB Table Schemas

All tables use **PAY_PER_REQUEST** billing (no capacity planning required).

### `traxs-backend-drivers-dev`

| Attribute | Type | Role |
|---|---|---|
| `driverId` | String | Partition Key |
| `phoneNumber` | String | GSI: `phone-index` (PK) |
| `deviceType` | String | `smartphone` \| `feature_phone` |
| `vehicleType` | String | `danfo` \| `keke` \| `okada` |
| `homepark` | String | Driver's home motor park |
| `isActive` | Boolean | Session status |
| `sessionStart` | String (ISO) | Session start timestamp |
| `currentLocation` | Map | `{ type: "Point", coordinates: [lng, lat] }` |
| `currentRoute` | String | Assigned corridor ID |
| `tripsToday` | Number | Trip counter (resets on activation) |
| `earningsToday` | Number | Cash earnings in ₦ |
| `airtimeEarned` | Number | Cumulative airtime reward in ₦ |

---

### `traxs-backend-passenger-events-dev`

| Attribute | Type | Role |
|---|---|---|
| `pk` | String | Partition Key — always `"passenger_event"` |
| `sk` | String | Sort Key — `{timestamp}#{eventId}` |
| `eventId` | String | UUID |
| `timestamp` | String (ISO) | Event time |
| `deviceId` | String | GSI: `device-index` (PK) |
| `location` | Map | `{ type: "Point", coordinates: [lng, lat] }` |
| `speed` | Number | km/h |
| `heading` | Number | Degrees 0–360 |
| `motionType` | String | `walking` \| `bus` \| `motorcycle` \| `stationary` |

---

### `traxs-backend-route-events-dev`

| Attribute | Type | Role |
|---|---|---|
| `eventId` | String | Partition Key (UUID) |
| `driverId` | String | Reporting driver |
| `eventType` | String | `road_blocked` \| `police_checkpoint` \| `flooding` \| `accident` \| `long_queue` |
| `location` | Map | `{ type: "Point", coordinates: [lng, lat] }` |
| `description` | String | Human-readable detail |
| `timestamp` | String (ISO) | GSI: `active-time-index` (SK) |
| `isActive` | Boolean | Whether event is still active |
| `isActiveStr` | String | `"true"` \| `"false"` — GSI: `active-time-index` (PK) |

---

### `traxs-backend-mobility-snapshots-dev`

| Attribute | Type | Role |
|---|---|---|
| `corridorId` | String | Partition Key |
| `timestamp` | String (ISO) | Sort Key |
| `snapshotPk` | String | Always `"snapshot"` — GSI: `all-time-index` (PK) |
| `corridorName` | String | Human-readable name |
| `passengerMovements` | Number | Events in last 5 minutes |
| `activeVehicles` | Number | Inferred vehicles on corridor |
| `averageOccupancy` | Number | Mean passengers per vehicle |
| `loadFactor` | Number | 0–100 |
| `demandScore` | Number | 0–100 |
| `supplyScore` | Number | 0–100 |
| `ghostCorridor` | Boolean | `demandScore > 70 AND supplyScore < 30` |

---

### `traxs-backend-inferred-vehicles-dev`

| Attribute | Type | Role |
|---|---|---|
| `vehicleId` | String | Partition Key (UUID) |
| `linkedDriverId` | String | Fused driver if within 150m |
| `estimatedOccupancy` | Number | Unique device count in cluster |
| `currentLocation` | Map | `{ type: "Point", coordinates: [lng, lat] }` |
| `assignedRoute` | String | GSI: `route-index` (PK) |
| `status` | String | `active` \| `idle` \| `lost` — GSI: `status-index` (PK) |
| `passengerDeviceIds` | List | Device IDs in cluster |
| `lastUpdated` | String (ISO) | GSI: `status-index` and `route-index` (SK) |

---

### `traxs-backend-ws-connections-dev`

| Attribute | Type | Role |
|---|---|---|
| `connectionId` | String | Partition Key |
| `connectedAt` | String (ISO) | Connection timestamp |
| `ttl` | Number | Unix epoch — auto-expired after 24 hours |

---

## Data Flow

### Passenger Event → Crowd Inference

```
POST /api/passengers/event
        │
        ├── Archive raw JSON to S3
        ├── Write event to DynamoDB (PassengerEvents table)
        ├── Publish event to Kinesis stream
        └── Broadcast passenger:event via WebSocket
                │
         [Kinesis trigger]
                │
        kinesisProcessPassengerEvent Lambda
                │
        crowdInference.js
                │
        1. Query DynamoDB for events in last 60 seconds
        2. Filter to events within 100m radius
        3. Check heading coherence (±30°) and speed coherence (±10 km/h)
        4. If ≥ 8 coherent devices → cluster detected
        5. Snap heading to nearest Lagos corridor
        6. Search for nearby active driver within 150m → driver fusion
        7. Upsert InferredVehicle in DynamoDB
        8. Broadcast vehicle:inferred via WebSocket
```

### Mobility Snapshot (every 5 minutes)

```
EventBridge rule (rate: 5 minutes)
        │
eventBridgeMobilitySnapshot Lambda
        │
mobilitySnapshot.js
        │
For each of 5 Lagos corridors:
        │
        ├── Count PassengerEvents in last 5 minutes
        ├── Query active InferredVehicles on this corridor
        ├── Calculate demandScore, supplyScore, loadFactor
        ├── Detect ghost corridor (demand > 70, supply < 30)
        ├── Write MobilitySnapshot to DynamoDB
        └── Broadcast snapshot:updated via WebSocket
```

---

## Crowd Inference Algorithm

The crowd inference service (`src/services/crowdInference.js`) uses a spatial clustering approach to detect moving vehicles from anonymous passenger device data.

### Algorithm parameters

| Parameter | Value | Description |
|---|---|---|
| `CLUSTER_RADIUS_METERS` | 100m | Maximum distance between devices in same cluster |
| `MIN_DEVICE_COUNT` | 8 | Minimum devices required to infer a vehicle |
| `HEADING_TOLERANCE_DEGREES` | ±30° | Heading coherence filter |
| `SPEED_TOLERANCE_KMH` | ±10 km/h | Speed coherence filter |
| `DRIVER_FUSION_RADIUS_METERS` | 150m | Range to link a registered driver to an inferred vehicle |
| `LOOKBACK_SECONDS` | 60s | Time window for clustering |

### Steps

1. Query all passenger events from the last 60 seconds
2. Filter to events within 100 metres of the trigger event (Haversine distance)
3. Apply heading coherence filter — all devices must be moving within ±30° of the trigger device
4. Apply speed coherence filter — all devices must be moving within ±10 km/h of the trigger device
5. If fewer than 8 coherent devices remain, abort (not enough evidence for a vehicle)
6. Snap the cluster heading to the nearest predefined Lagos corridor
7. Search for a registered active driver within 150m — if found, link them to the inferred vehicle
8. Upsert the `InferredVehicle` record (update existing on same corridor updated in last 2 minutes, otherwise create new)
9. Broadcast `vehicle:inferred` event to all connected WebSocket clients

### Lagos corridors

| ID | Name | Bearing |
|---|---|---|
| `oshodi-ikeja` | Oshodi–Ikeja | 320° |
| `cms-lekki` | CMS–Lekki | 90° |
| `ikorodu-cbd` | Ikorodu–CBD | 200° |
| `ikeja-oshodi` | Ikeja–Oshodi | 140° |
| `lekki-vi` | Lekki–Victoria Island | 270° |

---

## Bedrock Intelligence (Ask TRAXS)

The `POST /api/intelligence/ask` endpoint connects to **Amazon Bedrock** using the **Claude 3 Haiku** model to answer natural language questions about Lagos mobility.

### How it works

1. A question arrives at the endpoint
2. Live context is pulled from DynamoDB: latest corridor snapshots, active vehicles, active drivers, active route alerts
3. The context and question are formatted into a structured prompt
4. The prompt is sent to Claude Haiku via Bedrock `InvokeModel`
5. The response is returned to the caller with both the answer and the raw context

### Enabling the model

The model must be explicitly enabled before it can be used:

**AWS Console → Amazon Bedrock → Model access → Manage model access → Claude 3 Haiku → Save**

Activation takes approximately 1–2 minutes.

---

## USSD Integration

The `/api/ussd` endpoint is designed to be registered as a callback with **Africa's Talking**.

### Registering the webhook

1. Log in to [africastalking.com](https://africastalking.com)
2. Navigate to **USSD** → select or create a service code
3. Set the callback URL to your deployed endpoint: `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/dev/api/ussd`

### Session state machine

```
Entry ("")
  ├── 1 → Start Trip (activates driver, ₦50 airtime reward) [END]
  ├── 2 → Report Issue [CON]
  │     ├── 1 → Road Blocked [END]
  │     ├── 2 → Police Checkpoint [END]
  │     ├── 3 → Accident [END]
  │     ├── 4 → Flooding [END]
  │     └── 5 → Long Queue [END]
  ├── 3 → My Earnings Today [END]
  └── 4 → End Trip [END]
```

---

## IAM Permissions Required

The IAM user used for deployment requires the following AWS managed policies:

| Policy | Required for |
|---|---|
| `AdministratorAccess` | Simplest option — covers all of the below |

If you prefer scoped permissions, attach these individually:

| Policy | Required for |
|---|---|
| `AWSCloudFormationFullAccess` | Serverless Framework infrastructure provisioning |
| `AWSLambdaFullAccess` | Creating and deploying Lambda functions |
| `AmazonAPIGatewayAdministrator` | HTTP API and WebSocket API creation |
| `AmazonDynamoDBFullAccess` | Table creation and data operations |
| `AmazonS3FullAccess` | Deployment bucket and raw events bucket |
| `AmazonKinesisFullAccess` | Stream creation and event publishing |
| `AmazonSNSFullAccess` | Topic creation and message publishing |
| `AmazonEventBridgeFullAccess` | Scheduled rule creation |
| `AmazonBedrockFullAccess` | Model invocation |
| `IAMFullAccess` | Lambda execution role creation |
| `CloudWatchFullAccess` | Lambda log group creation |

---

## Troubleshooting

### `AWSCompromisedKeyQuarantineV3` error during deploy

AWS detected your access key was exposed publicly. This policy is applied at the **IAM user level** — creating a new key for the same user will not fix it. Create a **new IAM user** with fresh credentials.

### `credentials not found` error

The Serverless Framework does not read `.env` files. Set credentials in your terminal session:

**PowerShell:**
```powershell
Get-Content .env | Where-Object { $_ -match '^AWS_ACCESS_KEY_ID=|^AWS_SECRET_ACCESS_KEY=|^AWS_REGION=' } | ForEach-Object {
  $key, $val = $_ -split '=', 2
  [System.Environment]::SetEnvironmentVariable($key.Trim(), $val.Trim(), 'Process')
}
```

Or configure permanently with `aws configure`.

### Bedrock endpoint returns an error

Ensure the Claude 3 Haiku model is enabled in your account: **AWS Console → Bedrock → Model access**. It takes 1–2 minutes after enabling before it becomes available.

### WebSocket broadcast does nothing

`WEBSOCKET_API_ENDPOINT` in `.env` must be the **HTTPS** endpoint (not `wss://`). After deploy, copy the `WebSocketApiUrl` from the output and change `wss://` to `https://` before pasting it into `.env`.

### Seed script fails with `ResourceNotFoundException`

The DynamoDB tables must exist before seeding. Run `serverless deploy` first, then `npm run seed`.

### Lambda timeout on Ask TRAXS

The `intelligenceAsk` function has a 29-second timeout. If Bedrock is slow to respond, consider increasing the timeout in `serverless.yml` under the `intelligenceAsk` function definition.

---

## Scripts

| Command | Description |
|---|---|
| `npm run deploy` | Deploy to dev stage |
| `npm run deploy:prod` | Deploy to prod stage |
| `npm run remove` | Remove all AWS resources |
| `npm run seed` | Populate DynamoDB with demo data |
| `npm run logs` | View Lambda logs (requires `-f functionName`) |

---

## License

MIT
