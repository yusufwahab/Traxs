import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { MOCK_DRIVERS, MOCK_INFERRED_VEHICLES, MOCK_ROUTE_EVENTS } from '../data/mockData';

const TOAST_STYLE = { background: '#161B22', color: '#E6EDF3', border: '1px solid #30363D', fontSize: '13px' };

const ALERT_POOL = [
  { text: '⚠️ Road blocked — Apapa Expressway',         borderColor: '#DA3633' },
  { text: '🚔 Police checkpoint — Lekki-Epe Expressway', borderColor: '#F4A823' },
  { text: '🌊 Flooding reported — Surulere Underpass',    borderColor: '#DA3633' },
  { text: '⚠️ Accident reported — Third Mainland Bridge', borderColor: '#DA3633' },
  { text: '🚔 Checkpoint — Oshodi Bridge',                borderColor: '#F4A823' },
];

const WS_URL = import.meta.env.VITE_WEBSOCKET_URL || '';
const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const isRealWsUrl = WS_URL && WS_URL.startsWith('wss://');

// Normalize DynamoDB driver shape → store shape
function normalizeDriver(d) {
  const coords = d.currentLocation?.coordinates;
  return {
    driverId: d.driverId,
    vehicleType: d.vehicleType,
    homepark: d.homepark,
    currentRoute: d.currentRoute || null,
    lat: coords ? coords[1] : null,
    lng: coords ? coords[0] : null,
    isActive: d.isActive,
  };
}

// Normalize DynamoDB vehicle shape → store shape
function normalizeVehicle(v) {
  const coords = v.currentLocation?.coordinates;
  return {
    vehicleId: v.vehicleId,
    linkedDriverId: v.linkedDriverId,
    estimatedOccupancy: v.estimatedOccupancy,
    assignedRoute: v.assignedRoute,
    status: v.status,
    lat: coords ? coords[1] : null,
    lng: coords ? coords[0] : null,
  };
}

let booted = false;

export function useSocket() {
  const { setDrivers, setInferredVehicles, setRouteEvents, incrementPassengerCount, setConnected } = useStore();
  const wsRef = useRef(null);
  const mockIntervalsRef = useRef([]);

  function startMockSimulation() {
    setDrivers(MOCK_DRIVERS);
    setInferredVehicles(MOCK_INFERRED_VEHICLES);
    setRouteEvents(MOCK_ROUTE_EVENTS);

    const ids = [
      setInterval(() => {
        setDrivers(prev => prev.map(d => ({
          ...d,
          lat: d.lat + (Math.random() - 0.5) * 0.0018,
          lng: d.lng + (Math.random() - 0.5) * 0.0018,
        })));
      }, 3000),

      setInterval(() => {
        setInferredVehicles(prev => prev.map(v => ({
          ...v,
          estimatedOccupancy: Math.max(1, Math.min(18, v.estimatedOccupancy + Math.floor((Math.random() - 0.5) * 3))),
          lat: v.lat + (Math.random() - 0.5) * 0.0018,
          lng: v.lng + (Math.random() - 0.5) * 0.0018,
        })));
      }, 5000),

      setInterval(() => incrementPassengerCount(Math.floor(Math.random() * 4) + 1), 1500),

      setInterval(() => {
        const alert = ALERT_POOL[Math.floor(Math.random() * ALERT_POOL.length)];
        toast(alert.text, { duration: 5000, style: { ...TOAST_STYLE, border: `1px solid ${alert.borderColor}` } });
      }, 45000),
    ];

    mockIntervalsRef.current = ids;
  }

  function stopMockSimulation() {
    mockIntervalsRef.current.forEach(clearInterval);
    mockIntervalsRef.current = [];
  }

  async function loadInitialData() {
    try {
      const [driversRes, vehiclesRes, eventsRes] = await Promise.all([
        fetch(`${API_URL}/api/drivers/active`),
        fetch(`${API_URL}/api/inference/vehicles`),
        fetch(`${API_URL}/api/inference/events`),
      ]);

      const [driversJson, vehiclesJson, eventsJson] = await Promise.all([
        driversRes.json(),
        vehiclesRes.json(),
        eventsRes.json(),
      ]);

      if (driversJson.success) setDrivers(driversJson.data.map(normalizeDriver));
      if (vehiclesJson.success) setInferredVehicles(vehiclesJson.data.map(normalizeVehicle));
      if (eventsJson.success) setRouteEvents(eventsJson.data);
    } catch (err) {
      console.warn('[WS] Initial data load failed, keeping mock data:', err.message);
    }
  }

  function connectWebSocket() {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected to API Gateway WebSocket');
      setConnected(true);
      stopMockSimulation();
      loadInitialData();
    };

    ws.onmessage = (messageEvent) => {
      try {
        const { event, data } = JSON.parse(messageEvent.data);

        if (event === 'driver:location_update') {
          const { driverId, lat, lng, route } = data;
          setDrivers(prev => prev.map(d =>
            d.driverId === driverId ? { ...d, lat, lng, currentRoute: route } : d
          ));
        }

        if (event === 'vehicle:inferred') {
          const { vehicleId, lat, lng, occupancy, route, linkedDriver } = data;
          setInferredVehicles(prev => {
            const exists = prev.find(v => v.vehicleId === vehicleId);
            if (exists) {
              return prev.map(v => v.vehicleId === vehicleId
                ? { ...v, lat, lng, estimatedOccupancy: occupancy, assignedRoute: route }
                : v);
            }
            return [...prev, { vehicleId, lat, lng, estimatedOccupancy: occupancy, assignedRoute: route, linkedDriverId: linkedDriver, status: 'active' }];
          });
        }

        if (event === 'event:new_report') {
          const { eventType, lat, lng, description, timestamp } = data;
          const label = eventType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          setRouteEvents(prev => [{ eventId: Date.now().toString(), eventType, lat, lng, description, timestamp, isActive: true }, ...prev]);
          toast(`⚠️ ${label} — ${description || 'See map for details'}`, {
            duration: 6000,
            style: { ...TOAST_STYLE, border: '1px solid #DA3633' },
          });
        }

        if (event === 'passenger:event') {
          incrementPassengerCount(1);
        }

        if (event === 'snapshot:updated') {
          const { corridorId, ghostCorridor } = data;
          if (ghostCorridor) {
            toast(`🚨 Ghost corridor detected: ${corridorId.replace(/-/g, ' ')}`, {
              duration: 8000,
              style: { ...TOAST_STYLE, border: '1px solid #DA3633' },
            });
          }
        }
      } catch (err) {
        console.warn('[WS] Failed to parse message:', err.message);
      }
    };

    ws.onerror = (err) => {
      console.warn('[WS] WebSocket error — falling back to mock simulation');
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected');
      setConnected(false);
      // Reconnect after 5 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          connectWebSocket();
        }
      }, 5000);
    };
  }

  useEffect(() => {
    if (booted) return;
    booted = true;

    if (isRealWsUrl) {
      // Start with mock data for immediate visual feedback while connecting
      setDrivers(MOCK_DRIVERS);
      setInferredVehicles(MOCK_INFERRED_VEHICLES);
      setRouteEvents(MOCK_ROUTE_EVENTS);
      setTimeout(() => setConnected(true), 600);
      connectWebSocket();
    } else {
      // No real WebSocket configured — run full mock simulation
      setTimeout(() => setConnected(true), 600);
      startMockSimulation();
    }

    return () => {
      stopMockSimulation();
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount
        wsRef.current.close();
      }
      booted = false;
    };
  }, []);
}
