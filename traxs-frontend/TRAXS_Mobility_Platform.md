# TRAXS — Mobility Intelligence Platform
### Transport Real-time Analytics & Exchange System
**Transforming Nigeria's informal transit chaos into actionable city intelligence**

---

> *"4 million daily trips. Zero data collected. Until now."*

---

| | |
|---|---|
| **Document Type** | Hackathon Solution Brief |
| **Cloud Provider** | Amazon Web Services (AWS) |
| **Pilot Market** | Lagos, Nigeria — Scalable across Africa |
| **North Star Metric** | Passenger movements mapped per day |

---

## 1. The Problem

Every day, millions of Nigerians rely on informal transit — danfos, kekes, okadas, and ride-hailing services — to move through cities like Lagos. These vehicles handle the vast majority of urban mobility. Yet almost none of this movement is captured, structured, or analyzed.

### 1.1 What Is Happening Right Now

- Danfos, kekes, and okadas operate on organic, driver-defined routes with zero formal tracking
- No central system records origin-destination patterns, vehicle occupancy, or route efficiency
- Urban planners make infrastructure decisions based on outdated, expensive manual surveys
- Investors have no data to evaluate the viability of new transport corridors
- Government policy is formed without visibility into how informal transport actually functions

### 1.2 Who Suffers and How

| Stakeholder | How They Suffer |
|---|---|
| **Urban Planners** | Infrastructure built where data suggests — not where people actually move. BRT stops miss high-demand corridors. |
| **Investors** | No route viability data means decisions are made on gut feel. Capital stays away from high-potential corridors. |
| **Government** | Regulations like okada bans are enacted without understanding the mobility impact on dependent communities. |
| **Operators** | Drivers have no tools to optimize routes, understand demand patterns, or benchmark earnings. |

### 1.3 The Core Gap

The data already exists — generated every second by millions of moving phones and vehicles. The problem is that no one is capturing and structuring it into intelligence.

**Why can't Google just do this?**
Google needs smartphones. TRAXS works with feature phones through USSD — reaching the 60% of Nigeria that Google cannot.

---

## 2. Our Solution — TRAXS

TRAXS is a fully software-based mobility intelligence platform that passively collects, processes, and analyzes transportation data from Nigeria's informal transit ecosystem. It turns fragmented movement signals into structured insights for city planners, investors, and government — **with no hardware deployment required.**

### The Core Principle
We do not track vehicles. We observe the system. Passengers already carry GPS devices in their pockets. Drivers already interact with mobile networks. TRAXS fuses these existing signals into a real-time picture of how a city moves.

### 2.1 Who TRAXS Serves

**Data Sources — Those Who Generate the Data**
- Drivers (danfo, keke, okada) — active participants who trigger the system
- Passengers — passive participants whose movement is anonymously observed

**Customers — Those Who Consume the Insights**
- Urban Planners (LASMA, LAMATA, Ministry of Transport)
- Investors — private equity, real estate, transport operators
- Government — State and Federal policy teams

---

## 3. How It Works

### 3.1 Data Collection — Three Streams

#### Stream 1: Driver Activation (USSD + Lightweight App)

Drivers activate once at the start of their day. Two entry points based on device type:

| Driver Type | Activation Flow |
|---|---|
| **Feature Phone Driver** | Dials `*384*1#` → Selects 'Start Trip' (two button presses). Location tracked passively via cell tower triangulation through telco APIs. **No data cost to the driver.** |
| **Smartphone Driver** | Opens lightweight web app (no install). Taps 'Start My Day.' App runs silently, reporting GPS every 30 seconds to AWS IoT Core. |

**Driver Incentive — Why They Will Participate:**
Every check-in earns ₦50 airtime credit via Africa's Talking. Drivers evangelize it themselves. This solves the cold-start problem organically.

At end of day, drivers receive an automatic SMS: trips completed, estimated earnings, kilometers covered, busiest period. Simple. Valuable. No behavior change required.

**Cold Start Strategy — First 100 Drivers:**
Partner with 5 motor park captains in Lagos. Each controls 50+ drivers. One partnership = 50 active data sources immediately. Park captains receive a dashboard showing their park's performance — their incentive to cooperate.

#### Stream 2: Passive Passenger Detection

**Phase 1 (Launch):** Passengers share location passively through apps they already use — Google Maps, WhatsApp live location. No new app install required.

**Phase 2 (Scale):** A lightweight background SDK captures GPS traces, accelerometer motion signatures (distinguishing walking vs. bus vs. motorcycle), and speed data for road-snapping.

Passengers never press a button. Their movement is the data.

#### Stream 3: Ground-Level Event Reporting

Drivers report road-level events — blockages, police checkpoints, flooding, accidents — via the same USSD menu or app. These are among the most valuable data points the platform collects. No AI model can infer a police checkpoint. A driver 10 meters away can.

---

### 3.2 The Crowd Inference Engine — TRAXS's Core Intelligence

When multiple passenger devices move in the same direction, at the same speed, in close proximity — that is a vehicle. The passengers collectively act as a tracker for the vehicle they are riding in.

**How It Works:**
Amazon SageMaker runs a real-time clustering model on incoming location events. When it detects 8+ devices moving coherently along a road segment, it:

1. Infers a vehicle is present
2. Estimates occupancy from cluster size
3. Snaps it to the nearest road
4. Tracks it along its route

When a driver's USSD/GPS trace and a passenger cluster overlap in space and time, the system links them. The platform now knows the vehicle's identity, occupancy, departure point, and inferred destination — **without any tracker on the vehicle.**

### 3.3 Automatic Route Detection

Drivers do not declare their route. SageMaker watches each driver's movement trace and matches it against a route database built from OpenStreetMap and historical trip data. Within 2–3 minutes of movement, the route is identified automatically. Deviations update in real time.

---

## 4. AWS Architecture

### 4.1 Core Service Stack (5 Primary Services)

| AWS Service | Role |
|---|---|
| **AWS IoT Core** | Receives GPS events from smartphone drivers and passenger data |
| **Africa's Talking + API Gateway + Lambda** | Handles USSD sessions, airtime disbursement, serverless processing |
| **Amazon Kinesis** | Real-time event streaming backbone across all data streams |
| **Amazon SageMaker** | Crowd inference clustering + automatic route detection models |
| **Amazon Bedrock (Claude)** | Natural language interface — customers ask questions, platform answers with data |

### 4.2 Supporting Services

| AWS Service | Role |
|---|---|
| Amazon DynamoDB | Real-time driver session state and active vehicle registry |
| Amazon S3 | Central data lake — all raw and processed events |
| Amazon Athena | Serverless SQL queries on S3 — no database server required |
| AWS Location Service | Map rendering, geofencing, route snapping |
| Amazon QuickSight | Embedded analytics dashboards per customer segment |
| AWS Cognito | Multi-tenant authentication — different access levels per user type |

### 4.3 Data Flow

```
Driver USSD/App → IoT Core / API Gateway → Lambda → DynamoDB (active session)
       ↓
GPS/cell events → Kinesis → SageMaker crowd inference → route assigned
       ↓
Passenger data → Kinesis → SageMaker clustering → vehicle occupancy estimated
       ↓
Driver + passenger streams fused → vehicle identity linked to occupancy
       ↓
All events → S3 → Athena (queryable) → QuickSight dashboards
       ↓
Bedrock sits on top → natural language questions → data-backed answers
```

---

## 5. What Customers See

### 5.1 Urban Planners
- Live map of actual movement patterns versus formal infrastructure assumptions
- **Ghost corridor detection** — high-demand routes with zero formal transit coverage
- Congestion hotspots ranked by severity and time of day
- Before/after infrastructure impact analysis

**Example Insight:**
> There are an estimated 40,000 daily passenger movements between Ikorodu and Owutu with zero formal transit serving that corridor. This is the single highest-priority gap for BRT expansion in the northern network.

### 5.2 Investors
- Route viability scores — demand vs. supply gap on specific corridors
- Load factor data — seat occupancy rates by route, time, and day
- Revenue projections for new route launches based on observed demand

**Example Insight:**
> The Lagos Island–Lekki Phase 2 corridor shows consistent 90% average load factor between 17:00–20:00 daily, served by only 12 vehicles. A 20-vehicle operation has a conservative estimated monthly revenue of ₦4.2 million.

### 5.3 Government
- City-wide mobility health score by LGA
- Equity analysis — which low-income neighborhoods have worst transit access relative to demand
- **Policy simulation** — model the mobility impact of a regulation before it is enacted
- Exportable reports formatted for cabinet-level presentations

**Example Insight:**
> Simulating the proposed okada restriction in Lagos Island shows a projected disruption of ~80,000 daily passenger movements, concentrated in 3 wards with no viable danfo alternative. Alternative coverage recommendations attached.

---

## 6. Business Model

| Revenue Stream | Description |
|---|---|
| **Government SaaS** | LASMA, LAMATA, state transport ministries pay monthly subscription for city-wide mobility dashboards and API access |
| **Investor Data API** | Private equity, transport operators, real estate developers pay per-query or subscription for route viability data |
| **Operator Subscriptions** | Transport cooperatives and fleet operators subscribe for route analytics and driver performance data |
| **Development Finance Grants** | World Bank, IFC, African Development Bank actively fund African urban mobility data platforms — TRAXS is a strong candidate |

---

## 7. Why TRAXS Wins

### No Hardware Required
Entirely software-based. No sensors, no trackers, no physical deployment. Scales to any city with mobile network coverage — in Nigeria, that means everywhere.

### Works for Every Driver
Dual USSD + smartphone entry means no driver is excluded by device type. A Nokia feature phone driver and a smartphone driver both become data sources through the same backend.

### Genuinely Novel Intelligence
Crowd inference — deriving vehicle presence and occupancy from passenger device clustering — applies the same principle behind Waze and Google Maps traffic inference, specifically to informal transit vehicle detection. This is novel and defensible.

### Built-In Growth Flywheel
More drivers → more data → better insights → more customer value → more revenue → more driver incentives → more drivers. The system improves itself.

### Real African Context
USSD is not a compromise. It is the right answer for the Nigerian market. It works without internet, without a smartphone, without data costs to the driver. This reflects genuine understanding of the operating environment.

---

## 8. Demo Plan — June 11

The demo runs as a live loop judges watch in real time.

### The Sequence

| Step | What Happens | What Judges See |
|---|---|---|
| 1 | Driver phone dials `*384*1#` → selects Start Trip | System registers driver live on dashboard |
| 2 | Passenger phone begins moving along a Lagos corridor | Device enters the network on live map |
| 3 | SageMaker detects device cluster | Vehicle inferred — occupancy updates live |
| 4 | Driver and passenger traces fuse | Vehicle linked to route automatically — no declaration made |
| 5 | Judge asks Bedrock: *"Which area of Lagos has the highest unmet transport demand right now?"* | Data-backed answer returns with map evidence |

### The Memorable Moment
> Two phones. One USSD dial. A vehicle appearing on the map in real time with live occupancy — built from nothing but software, mobile signals, and AI.

### Demo Preparation Checklist
- [ ] Pre-load Bedrock with realistic Lagos corridor data
- [ ] Rehearse the exact Bedrock question 20+ times
- [ ] Prepare screenshot backup in case of live failure
- [ ] Test USSD flow end-to-end on Africa's Talking sandbox
- [ ] Confirm all AWS services are live and connected 24hrs before showcase

---

## 9. Pitch Opening (Use This)

> *"This morning, 4 million people moved through Lagos. Zero data was collected about how, where, or when. Every city planner, every investor, every government official making decisions about Lagos transport is flying blind. TRAXS changes that — using nothing but the phones already in people's pockets."*

---

*TRAXS — Nigeria's cities move every day. Now they can see themselves move.*
