import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { MOCK_DRIVERS, MOCK_INFERRED_VEHICLES, MOCK_ROUTE_EVENTS } from '../data/mockData';

const TOAST_STYLE = { background: '#161B22', color: '#E6EDF3', border: '1px solid #30363D', fontSize: '13px' };

const ALERT_POOL = [
  { text: '⚠️ Road blocked — Apapa Expressway',      borderColor: '#DA3633' },
  { text: '🚔 Police checkpoint — Lekki-Epe Expressway', borderColor: '#F4A823' },
  { text: '🌊 Flooding reported — Surulere Underpass',   borderColor: '#DA3633' },
  { text: '⚠️ Accident reported — Third Mainland Bridge', borderColor: '#DA3633' },
  { text: '🚔 Checkpoint — Oshodi Bridge',               borderColor: '#F4A823' },
];

let booted = false;

export function useSocket() {
  const { setDrivers, setInferredVehicles, setRouteEvents, incrementPassengerCount, setConnected } = useStore();

  useEffect(() => {
    if (booted) return;
    booted = true;

    // Seed store immediately — app looks live on first render
    setDrivers(MOCK_DRIVERS);
    setInferredVehicles(MOCK_INFERRED_VEHICLES);
    setRouteEvents(MOCK_ROUTE_EVENTS);

    // Small delay then mark connected — mimics a real handshake
    const connectTimer = setTimeout(() => setConnected(true), 600);

    // Driver positions drift every 3 s — markers visibly move on the map
    const driverInterval = setInterval(() => {
      setDrivers((prev) =>
        prev.map((d) => ({
          ...d,
          lat: d.lat + (Math.random() - 0.5) * 0.0018,
          lng: d.lng + (Math.random() - 0.5) * 0.0018,
        }))
      );
    }, 3000);

    // Vehicle positions and occupancy drift every 5 s
    const vehicleInterval = setInterval(() => {
      setInferredVehicles((prev) =>
        prev.map((v) => ({
          ...v,
          estimatedOccupancy: Math.max(1, Math.min(18, v.estimatedOccupancy + Math.floor((Math.random() - 0.5) * 3))),
          lat: v.lat + (Math.random() - 0.5) * 0.0018,
          lng: v.lng + (Math.random() - 0.5) * 0.0018,
        }))
      );
    }, 5000);

    // Passenger count increments every 1.5 s — sidebar number keeps climbing
    const passengerInterval = setInterval(() => {
      incrementPassengerCount(Math.floor(Math.random() * 4) + 1);
    }, 1500);

    // Random route-event toast every 45 s
    const alertInterval = setInterval(() => {
      const alert = ALERT_POOL[Math.floor(Math.random() * ALERT_POOL.length)];
      toast(alert.text, {
        duration: 5000,
        style: { ...TOAST_STYLE, border: `1px solid ${alert.borderColor}` },
      });
    }, 45000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(driverInterval);
      clearInterval(vehicleInterval);
      clearInterval(passengerInterval);
      clearInterval(alertInterval);
      booted = false;
    };
  }, []);
}
