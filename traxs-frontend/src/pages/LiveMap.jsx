import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../store/useStore';
import { MOCK_GHOST_CORRIDOR_POLYLINES } from '../data/mockData';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Route data & demo entities ─────────────────────────────────────────────────
const ROUTE_WAYPOINTS = {
  'Oshodi-Ikeja': [
    { lat: 6.5568, lng: 3.3486 }, { lat: 6.5612, lng: 3.3498 },
    { lat: 6.5680, lng: 3.3510 }, { lat: 6.5720, lng: 3.3515 },
    { lat: 6.5780, lng: 3.3520 }, { lat: 6.6018, lng: 3.3515 },
  ],
  'Ikeja-CMS': [
    { lat: 6.6018, lng: 3.3515 }, { lat: 6.5800, lng: 3.3600 },
    { lat: 6.5500, lng: 3.3700 }, { lat: 6.5200, lng: 3.3800 },
    { lat: 6.4900, lng: 3.3900 }, { lat: 6.4541, lng: 3.3947 },
  ],
  'CMS-Lekki': [
    { lat: 6.4541, lng: 3.3947 }, { lat: 6.4550, lng: 3.4200 },
    { lat: 6.4600, lng: 3.4600 }, { lat: 6.4650, lng: 3.5000 },
    { lat: 6.4698, lng: 3.5852 },
  ],
  'Lekki-Ajah': [
    { lat: 6.4698, lng: 3.5852 }, { lat: 6.4680, lng: 3.6100 },
    { lat: 6.4670, lng: 3.6400 }, { lat: 6.4660, lng: 3.6700 },
    { lat: 6.4650, lng: 3.7000 },
  ],
  'Ikorodu-Owutu': [
    { lat: 6.6194, lng: 3.5060 }, { lat: 6.6100, lng: 3.5100 },
    { lat: 6.6000, lng: 3.5150 }, { lat: 6.5900, lng: 3.5200 },
    { lat: 6.5800, lng: 3.5250 },
  ],
};

// Pre-placed demo vehicles — always visible regardless of API state
const DEMO_ENTITIES = [
  { id: 'DRV-A1', route: 'Oshodi-Ikeja',  type: 'driver',  startWp: 0, stepMs: 175 },
  { id: 'DRV-A2', route: 'Oshodi-Ikeja',  type: 'driver',  startWp: 3, stepMs: 215 },
  { id: 'DRV-B1', route: 'Ikeja-CMS',     type: 'driver',  startWp: 0, stepMs: 195 },
  { id: 'DRV-B2', route: 'Ikeja-CMS',     type: 'driver',  startWp: 2, stepMs: 155 },
  { id: 'DRV-C1', route: 'CMS-Lekki',     type: 'driver',  startWp: 1, stepMs: 235 },
  { id: 'DRV-D1', route: 'Lekki-Ajah',    type: 'driver',  startWp: 0, stepMs: 185 },
  { id: 'DRV-E1', route: 'Ikorodu-Owutu', type: 'driver',  startWp: 2, stepMs: 205 },
  { id: 'VEH-A1', route: 'Oshodi-Ikeja',  type: 'vehicle', startWp: 2, stepMs: 245 },
  { id: 'VEH-B1', route: 'Ikeja-CMS',     type: 'vehicle', startWp: 4, stepMs: 165 },
  { id: 'VEH-C1', route: 'CMS-Lekki',     type: 'vehicle', startWp: 0, stepMs: 225 },
  { id: 'VEH-D1', route: 'Lekki-Ajah',    type: 'vehicle', startWp: 2, stepMs: 190 },
];

const CONGESTION_POINTS = [
  [6.5568, 3.3486, 0.9],
  [6.6018, 3.3515, 0.7],
  [6.4541, 3.3947, 0.8],
  [6.4698, 3.5852, 0.6],
  [6.6194, 3.5060, 0.5],
  [6.5022, 3.3603, 0.7],
  [6.5833, 3.3833, 0.6],
];

const MOTOR_PARKS = [
  { name: 'Oshodi',  lat: 6.5568, lng: 3.3486 },
  { name: 'Ikeja',   lat: 6.6018, lng: 3.3515 },
  { name: 'CMS',     lat: 6.4541, lng: 3.3947 },
  { name: 'Lekki',   lat: 6.4698, lng: 3.5852 },
  { name: 'Ikorodu', lat: 6.6194, lng: 3.5060 },
];

const LAYERS_DEFAULT = {
  drivers: true, vehicles: true, events: true,
  corridors: true, passengers: true, heatmap: true,
};

const DEMO_DRIVER_COUNT   = DEMO_ENTITIES.filter(e => e.type === 'driver').length;
const DEMO_VEHICLE_COUNT  = DEMO_ENTITIES.filter(e => e.type === 'vehicle').length;

// ── Pure helpers ───────────────────────────────────────────────────────────────

function interpolate(start, end, steps) {
  return Array.from({ length: steps }, (_, i) => ({
    lat: start.lat + (end.lat - start.lat) * ((i + 1) / steps),
    lng: start.lng + (end.lng - start.lng) * ((i + 1) / steps),
  }));
}

function getBearing(start, end) {
  const dLng = (end.lng - start.lng) * Math.PI / 180;
  const lat1 = start.lat * Math.PI / 180;
  const lat2 = end.lat  * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function makeBusIcon(type, bearing) {
  const color = type === 'driver' ? '#1A6B3C' : '#F4A823';
  const w = type === 'driver' ? 14 : 12;
  const h = type === 'driver' ? 22 : 18;
  const wr = w - 2, hr = h - 2;
  return L.divIcon({
    className: '',
    html: `<div style="transform:rotate(${bearing}deg);width:${w}px;height:${h}px;transform-origin:50% 50%;">
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="0" width="${wr}" height="${hr}" rx="3" fill="${color}"/>
        <rect x="2" y="2" width="${wr-2}" height="${Math.round(h * 0.25)}" rx="1" fill="rgba(255,255,255,0.38)"/>
        <rect x="2" y="${Math.round(h * 0.36)}" width="${wr-2}" height="${Math.round(h * 0.28)}" rx="1" fill="rgba(0,0,0,0.18)"/>
        <circle cx="${Math.round(w/2)}" cy="${h - 4}" r="1.5" fill="rgba(255,255,255,0.8)"/>
      </svg>
    </div>`,
    iconSize: [w, h],
    iconAnchor: [Math.round(w / 2), Math.round(h / 2)],
  });
}

function makePulseEventIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:24px;height:24px;">
      <div style="position:absolute;inset:0;border-radius:50%;background:rgba(239,68,68,0.35);animation:evtPulse 1.4s ease-out infinite;"></div>
      <div style="position:absolute;inset:0;border-radius:50%;background:rgba(239,68,68,0.18);animation:evtPulse 1.4s ease-out 0.5s infinite;"></div>
      <div style="position:absolute;top:7px;left:7px;width:10px;height:10px;border-radius:50%;background:#EF4444;border:1.5px solid rgba(255,255,255,0.45);"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

function makeSimIcon(status) {
  const color = status === 'active' ? '#2D9E5F' : '#F4A823';
  const rings = status === 'active'
    ? `<div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${color};animation:ussdRipple 1.6s ease-out infinite;"></div>
       <div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${color};animation:ussdRipple 1.6s ease-out 0.55s infinite;"></div>`
    : '';
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:28px;height:28px;">
             ${rings}
             <div style="position:absolute;inset:5px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 10px ${color}88;"></div>
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function watClock() {
  const now = new Date();
  return {
    date: now.toLocaleDateString('en-NG', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      timeZone: 'Africa/Lagos',
    }).toUpperCase(),
    time: now.toLocaleTimeString('en-NG', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'Africa/Lagos', hour12: false,
    }),
  };
}

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ── MapController ──────────────────────────────────────────────────────────────
function MapController() {
  const map = useMap();
  const mapFlyTarget    = useStore((s) => s.mapFlyTarget);
  const setMapFlyTarget = useStore((s) => s.setMapFlyTarget);

  useEffect(() => {
    if (!mapFlyTarget) return;
    map.flyTo([mapFlyTarget.lat, mapFlyTarget.lng], mapFlyTarget.zoom ?? 14, { duration: 1.5 });
    setMapFlyTarget(null);
  }, [mapFlyTarget]);

  return null;
}

// ── USSD Simulated Driver Marker ──────────────────────────────────────────────
function SimulatedDriverMarker({ driver }) {
  const markerRef = useRef(null);
  useEffect(() => {
    const m = markerRef.current;
    if (!m) return;
    const t = setTimeout(() => m.openPopup(), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <Marker
      ref={markerRef}
      position={[driver.position.lat, driver.position.lng]}
      icon={makeSimIcon(driver.status)}
      zIndexOffset={1000}
    >
      <Popup>
        <div style={{ minWidth: '160px', background: '#161B22', color: '#E6EDF3', padding: '2px' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.08em', color: '#2D9E5F', margin: '0 0 4px' }}>
            {driver.status === 'active' ? '▶ NEW DRIVER' : '✓ TRIP COMPLETE'}
          </p>
          <p style={{ fontSize: '12px', margin: '0 0 2px' }}>Danfo · {driver.routeLabel}</p>
          <p style={{ color: '#8B949E', fontSize: '11px', margin: 0 }}>Activated via USSD</p>
        </div>
      </Popup>
    </Marker>
  );
}

// ── Animation Engine ───────────────────────────────────────────────────────────
function AnimationEngine({ layersRef, ghostData }) {
  const map = useMap();
  const routeEvents = useStore((s) => s.routeEvents);

  const entityState  = useRef({});
  const stepTimes    = useRef({});
  const rafRef       = useRef(null);
  const ghostLines   = useRef([]);
  const heatCircles  = useRef([]);
  const densityCircs = useRef([]);
  const eventMarkers = useRef({});
  const paxDots      = useRef([]);
  const intervals    = useRef([]);
  const pausedRef    = useRef(false);
  const intensities  = useRef(CONGESTION_POINTS.map(p => p[2]));

  // Pause animation when tab hidden
  useEffect(() => {
    const fn = () => { pausedRef.current = document.hidden; };
    document.addEventListener('visibilitychange', fn);
    return () => document.removeEventListener('visibilitychange', fn);
  }, []);

  // ── Main setup effect (runs once on mount) ─────────────────────────────────
  useEffect(() => {
    const routePathLines = [];

    // Faint route corridor background lines
    Object.values(ROUTE_WAYPOINTS).forEach(wps => {
      const line = L.polyline(
        wps.map(p => [p.lat, p.lng]),
        { color: 'rgba(45,158,95,0.12)', weight: 3, dashArray: '5 8', interactive: false }
      ).addTo(map);
      routePathLines.push(line);
    });

    // Demo entity markers + trail lines
    DEMO_ENTITIES.forEach(({ id, route, type, startWp, stepMs }) => {
      const wps = ROUTE_WAYPOINTS[route];
      if (!wps) return;
      const wpIdx   = startWp % wps.length;
      const nextIdx = (wpIdx + 1) % wps.length;
      const bearing = getBearing(wps[wpIdx], wps[nextIdx]);
      const interp  = interpolate(wps[wpIdx], wps[nextIdx], 10);
      const initPos = wps[wpIdx];

      const marker = L.marker([initPos.lat, initPos.lng], {
        icon: makeBusIcon(type, bearing),
        interactive: false,
        zIndexOffset: type === 'driver' ? 200 : 100,
      }).addTo(map);

      const trail = L.polyline([], {
        color: type === 'driver' ? '#1A6B3C' : '#F4A823',
        weight: 2, opacity: 0.45, interactive: false,
      }).addTo(map);

      entityState.current[id] = {
        marker, trail, wps, wpIdx, interpStep: 0, interpPoints: interp,
        trailPts: [initPos], bearing, type, stepMs,
      };
      stepTimes.current[id] = performance.now();
    });

    // Animated ghost corridor lines
    ghostData.forEach(corridor => {
      const line = L.polyline(corridor.polyline, {
        color: '#DA3633', weight: 3, opacity: 0.45, dashArray: '6 4', interactive: false,
      }).addTo(map);
      ghostLines.current.push({ line, phase: Math.random() * Math.PI * 2 });
    });

    // Heatmap circles (L.circle gives meter-radius blobs)
    CONGESTION_POINTS.forEach(([lat, lng, intensity], i) => {
      const color = intensity > 0.7 ? '#EF4444' : intensity > 0.4 ? '#F4A823' : '#2D9E5F';
      const circle = L.circle([lat, lng], {
        radius: 700, color: 'none',
        fillColor: color, fillOpacity: intensity * 0.22, interactive: false,
      }).addTo(map);
      heatCircles.current.push({ circle, idx: i });
    });

    // Motor park density circles (breathing pulse)
    MOTOR_PARKS.forEach(({ lat, lng }) => {
      const circle = L.circle([lat, lng], {
        radius: 450, color: 'rgba(45,158,95,0.4)', weight: 1,
        fillColor: 'rgba(26,107,60,0.12)', fillOpacity: 1, interactive: false,
      }).addTo(map);
      densityCircs.current.push({ circle, phase: Math.random() * Math.PI * 2 });
    });

    // ── rAF loop: smooth vehicle interpolation ─────────────────────────────
    const animate = (ts) => {
      if (!pausedRef.current) {
        Object.entries(entityState.current).forEach(([id, s]) => {
          const visible = s.type === 'driver'
            ? layersRef.current.drivers
            : layersRef.current.vehicles;
          s.marker.setOpacity(visible ? 1 : 0);
          s.trail.setStyle({ opacity: visible ? 0.45 : 0 });
          if (!visible) { stepTimes.current[id] = ts; return; }

          if (ts - stepTimes.current[id] < s.stepMs) return;
          stepTimes.current[id] = ts;

          s.interpStep += 1;
          if (s.interpStep >= s.interpPoints.length) {
            s.interpStep = 0;
            s.wpIdx = (s.wpIdx + 1) % s.wps.length;
            const nxt = (s.wpIdx + 1) % s.wps.length;
            s.interpPoints = interpolate(s.wps[s.wpIdx], s.wps[nxt], 10);
            s.bearing = getBearing(s.wps[s.wpIdx], s.wps[nxt]);
          }

          const pos = s.interpPoints[s.interpStep];
          if (!pos) return;

          s.marker.setLatLng([pos.lat, pos.lng]);
          s.marker.setIcon(makeBusIcon(s.type, s.bearing));

          s.trailPts.push(pos);
          if (s.trailPts.length > 7) s.trailPts.shift();
          s.trail.setLatLngs(s.trailPts.map(p => [p.lat, p.lng]));
        });
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    // ── Ghost corridor pulse + event marker visibility (50ms) ──────────────
    const ghostId = setInterval(() => {
      const t = Date.now() / 1000;
      const showCorridors = layersRef.current.corridors;
      ghostLines.current.forEach(({ line, phase }) => {
        if (showCorridors) {
          const op = 0.3 + 0.4 * ((Math.sin(t * Math.PI + phase) + 1) / 2);
          line.setStyle({ opacity: op });
        } else {
          line.setStyle({ opacity: 0 });
        }
      });
      const evtOp = layersRef.current.events ? 1 : 0;
      Object.values(eventMarkers.current).forEach(m => {
        try { m.setOpacity(evtOp); } catch {}
      });
    }, 50);
    intervals.current.push(ghostId);

    // ── Density circles breathing + heatmap toggle (100ms) ────────────────
    const densId = setInterval(() => {
      const t = Date.now() / 1000;
      densityCircs.current.forEach(({ circle, phase }) => {
        const scale = 0.85 + 0.15 * ((Math.sin((t * Math.PI * 2) / 3 + phase) + 1) / 2);
        circle.setRadius(Math.round(450 * scale));
      });
      heatCircles.current.forEach(({ circle, idx }) => {
        const v = intensities.current[idx];
        const op = layersRef.current.heatmap && Number.isFinite(v) ? v * 0.22 : 0;
        circle.setStyle({ fillOpacity: op });
      });
    }, 100);
    intervals.current.push(densId);

    // ── Heatmap intensity fluctuation (every 10s) ──────────────────────────
    const heatId = setInterval(() => {
      intensities.current = intensities.current.map(v =>
        Math.max(0.1, Math.min(1.0, v + (Math.random() - 0.5) * 0.4))
      );
      heatCircles.current.forEach(({ circle, idx }) => {
        const v = intensities.current[idx];
        if (!Number.isFinite(v)) return;
        const color = v > 0.7 ? '#EF4444' : v > 0.4 ? '#F4A823' : '#2D9E5F';
        if (layersRef.current.heatmap) circle.setStyle({ fillColor: color, fillOpacity: v * 0.22 });
      });
    }, 10000);
    intervals.current.push(heatId);

    // ── Demand event circles on ghost corridors (every 5s) ─────────────────
    const demandId = setInterval(() => {
      if (!layersRef.current.corridors) return;
      ghostData.forEach(corridor => {
        if (!corridor.polyline?.length) return;
        const pt = corridor.polyline[Math.floor(Math.random() * corridor.polyline.length)];
        const dot = L.circleMarker(pt, {
          radius: 8, fillColor: '#EF4444', fillOpacity: 0.7,
          color: 'none', interactive: false,
        }).addTo(map);
        let r = 8;
        const expandId = setInterval(() => {
          r += 0.9;
          const op = Math.max(0, 0.7 * (1 - (r - 8) / 12));
          dot.setRadius(r);
          dot.setStyle({ fillOpacity: op });
          if (r >= 20) { clearInterval(expandId); if (map.hasLayer(dot)) map.removeLayer(dot); }
        }, 80);
      });
    }, 5000);
    intervals.current.push(demandId);

    // ── Passenger dot rain (every 700ms, max 15 dots) ──────────────────────
    const paxId = setInterval(() => {
      if (!layersRef.current.passengers) return;
      if (paxDots.current.length >= 15) {
        const old = paxDots.current.shift();
        if (old && map.hasLayer(old)) map.removeLayer(old);
      }
      const routeWps = Object.values(ROUTE_WAYPOINTS);
      const wps = routeWps[Math.floor(Math.random() * routeWps.length)];
      const wp  = wps[Math.floor(Math.random() * wps.length)];
      const dot = L.circleMarker(
        [wp.lat + (Math.random() - 0.5) * 0.002, wp.lng + (Math.random() - 0.5) * 0.002],
        { radius: 3, fillColor: '#3B82F6', fillOpacity: 0.9, color: 'none', interactive: false }
      ).addTo(map);
      paxDots.current.push(dot);
      let op = 0.9;
      const fadeId = setInterval(() => {
        op -= 0.045;
        if (op <= 0) {
          clearInterval(fadeId);
          if (map.hasLayer(dot)) map.removeLayer(dot);
          paxDots.current = paxDots.current.filter(d => d !== dot);
        } else {
          dot.setStyle({ fillOpacity: op });
        }
      }, 150);
    }, 700);
    intervals.current.push(paxId);

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafRef.current);
      intervals.current.forEach(clearInterval);
      intervals.current = [];

      Object.values(entityState.current).forEach(({ marker, trail }) => {
        if (map.hasLayer(marker)) map.removeLayer(marker);
        if (map.hasLayer(trail))  map.removeLayer(trail);
      });
      routePathLines.forEach(l => { if (map.hasLayer(l)) map.removeLayer(l); });
      ghostLines.current.forEach(({ line }) => { if (map.hasLayer(line)) map.removeLayer(line); });
      heatCircles.current.forEach(({ circle }) => { if (map.hasLayer(circle)) map.removeLayer(circle); });
      densityCircs.current.forEach(({ circle }) => { if (map.hasLayer(circle)) map.removeLayer(circle); });
      paxDots.current.forEach(d => { if (map.hasLayer(d)) map.removeLayer(d); });
      Object.values(eventMarkers.current).forEach(m => { if (map.hasLayer(m)) map.removeLayer(m); });

      entityState.current  = {};
      ghostLines.current   = [];
      heatCircles.current  = [];
      densityCircs.current = [];
      paxDots.current      = [];
      eventMarkers.current = {};
    };
  }, [map]); // eslint-disable-line

  // ── Route event markers (re-run when events change) ────────────────────────
  useEffect(() => {
    Object.values(eventMarkers.current).forEach(m => {
      if (map.hasLayer(m)) map.removeLayer(m);
    });
    eventMarkers.current = {};

    routeEvents.forEach(e => {
      if (!e.lat || !e.lng) return;
      const m = L.marker([e.lat, e.lng], { icon: makePulseEventIcon(), zIndexOffset: 500 })
        .bindPopup(`<div style="min-width:170px;background:#161B22;color:#E6EDF3;padding:2px">
          <p style="font-family:monospace;font-size:12px;margin:0 0 4px;color:#DA3633">${e.eventType || 'Event'}</p>
          <p style="font-size:12px;margin:0 0 2px">${e.location || ''}</p>
          <p style="color:#8B949E;font-size:11px;margin:0 0 4px">${e.description || ''}</p>
          <p style="color:#8B949E;font-size:10px;font-family:monospace;margin:0">${timeAgo(e.timestamp)}</p>
        </div>`)
        .addTo(map);
      eventMarkers.current[e.id || String(Math.random())] = m;
    });

    return () => {
      Object.values(eventMarkers.current).forEach(m => {
        if (map.hasLayer(m)) map.removeLayer(m);
      });
      eventMarkers.current = {};
    };
  }, [routeEvents, map]);

  return null;
}

// ── Velocity Sparkline ─────────────────────────────────────────────────────────
function Sparkline({ data }) {
  if (data.length < 2) return null;
  const W = 84, H = 26;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(max - min, 1);
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    H - ((v - min) / range) * H * 0.75 - H * 0.12,
  ]);
  const polyPts = pts.map(p => p.join(',')).join(' ');
  return (
    <svg width={W} height={H} style={{ display: 'block', marginTop: '4px' }}>
      <polyline points={polyPts} fill="none" stroke="#2D9E5F" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Main LiveMap component ─────────────────────────────────────────────────────
export default function LiveMap() {
  const [layers, setLayers] = useState(LAYERS_DEFAULT);
  const [clock, setClock]   = useState(watClock);
  const [velHistory, setVelHistory] = useState([28, 32, 30, 35, 29, 34, 27, 38, 31, 33]);

  const layersRef = useRef(layers);
  useEffect(() => { layersRef.current = layers; }, [layers]);

  const activeDrivers       = useStore((s) => s.activeDrivers);
  const inferredVehicles    = useStore((s) => s.inferredVehicles);
  const routeEvents         = useStore((s) => s.routeEvents);
  const passengerEventCount = useStore((s) => s.passengerEventCount);
  const simulatedDriver     = useStore((s) => s.simulatedDriver);

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setClock(watClock()), 1000);
    return () => clearInterval(id);
  }, []);

  // Network velocity simulation (updates every 5s)
  useEffect(() => {
    const id = setInterval(() => {
      setVelHistory(prev => {
        const last = prev[prev.length - 1];
        const next = Math.max(15, Math.min(58, last + (Math.random() - 0.5) * 9));
        return [...prev.slice(1), Math.round(next)];
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const toggle = (key) => setLayers(l => ({ ...l, [key]: !l[key] }));
  const currentVel = velHistory[velHistory.length - 1];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <style>{`
        @keyframes ussdRipple {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(3.5); opacity: 0;   }
        }
        @keyframes evtPulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0;   }
        }
      `}</style>

      <MapContainer center={[6.5244, 3.3792]} zoom={12} style={{ width: '100%', height: '100%' }} zoomControl>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />
        <MapController />
        <AnimationEngine layersRef={layersRef} ghostData={MOCK_GHOST_CORRIDOR_POLYLINES} />
        {simulatedDriver?.position && (
          <SimulatedDriverMarker key={simulatedDriver.driverId} driver={simulatedDriver} />
        )}
      </MapContainer>

      {/* Layer Controls */}
      <div style={{
        position: 'absolute', top: '16px', right: '16px', zIndex: 1000,
        background: '#161B22', border: '1px solid #30363D', borderRadius: '4px',
        padding: '12px 14px', minWidth: '170px',
      }}>
        <p style={{ color: '#8B949E', fontSize: '10px', letterSpacing: '0.08em', margin: '0 0 10px' }}>LAYERS</p>
        {[
          { key: 'drivers',    label: 'Active Drivers',    color: '#1A6B3C' },
          { key: 'vehicles',   label: 'Inferred Vehicles', color: '#F4A823' },
          { key: 'events',     label: 'Route Events',      color: '#EF4444' },
          { key: 'corridors',  label: 'Ghost Corridors',   color: '#DA3633' },
          { key: 'passengers', label: 'Passenger Dots',    color: '#3B82F6' },
          { key: 'heatmap',    label: 'Congestion',        color: '#EF4444' },
        ].map(({ key, label, color }) => (
          <label key={key} onClick={() => toggle(key)} style={{
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            padding: '4px 0', color: layers[key] ? '#E6EDF3' : '#8B949E', fontSize: '12px',
          }}>
            <span style={{
              width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
              background: layers[key] ? color : '#30363D', transition: 'background 0.15s',
            }} />
            {label}
          </label>
        ))}
      </div>

      {/* Info Panel */}
      <div style={{
        position: 'absolute', bottom: '24px', left: '16px', zIndex: 1000,
        background: 'rgba(22,27,34,0.94)', border: '1px solid #30363D',
        borderLeft: '2px solid #1A6B3C',
        borderRadius: '4px', padding: '16px 20px',
        minWidth: '220px', backdropFilter: 'blur(4px)',
      }}>
        {/* Clock */}
        <div style={{ borderBottom: '1px solid #30363D', marginBottom: '12px', paddingBottom: '12px' }}>
          <p style={{ color: '#8B949E', fontSize: '9px', letterSpacing: '0.12em', margin: '0 0 3px' }}>LAGOS TIME · WAT</p>
          <p style={{ color: '#8B949E', fontSize: '10px', fontFamily: 'monospace', margin: '0 0 2px' }}>{clock.date}</p>
          <p style={{ color: '#2D9E5F', fontFamily: 'monospace', fontSize: '20px', fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
            {clock.time}
          </p>
        </div>

        <p style={{ color: '#8B949E', fontSize: '10px', letterSpacing: '0.08em', margin: '0 0 12px' }}>LIVE NETWORK</p>
        {[
          { label: 'Active Drivers',          value: activeDrivers.length    + DEMO_DRIVER_COUNT,   color: '#1A6B3C' },
          { label: 'Inferred Vehicles',        value: inferredVehicles.length + DEMO_VEHICLE_COUNT,  color: '#F4A823' },
          { label: 'Passenger Events (5m)',    value: passengerEventCount,                           color: '#E6EDF3' },
          { label: 'Active Alerts',            value: routeEvents.length, color: routeEvents.length > 0 ? '#DA3633' : '#E6EDF3' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#8B949E', fontSize: '12px' }}>{label}</span>
            <span style={{ color, fontFamily: 'monospace', fontSize: '14px', fontWeight: 700 }}>{value}</span>
          </div>
        ))}

        {/* Network Velocity + Sparkline */}
        <div style={{ borderTop: '1px solid #30363D', marginTop: '4px', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#8B949E', fontSize: '11px' }}>NETWORK VELOCITY</span>
            <span style={{ color: '#2D9E5F', fontFamily: 'monospace', fontSize: '14px', fontWeight: 700 }}>
              {currentVel} km/h
            </span>
          </div>
          <Sparkline data={velHistory} />
        </div>
      </div>
    </div>
  );
}
