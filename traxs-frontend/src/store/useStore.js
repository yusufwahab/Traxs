import { create } from 'zustand';
import toast from 'react-hot-toast';

const TOAST = { background: '#161B22', color: '#E6EDF3', border: '1px solid #1A6B3C', fontSize: '13px' };

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function logEntry(msg) {
  const t = new Date().toLocaleTimeString('en-NG', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'Africa/Lagos', hour12: false,
  });
  return { id: Date.now() + Math.random(), time: t, message: msg };
}

export const useStore = create((set, get) => ({
  activeDrivers: [],
  inferredVehicles: [],
  routeEvents: [],
  passengerEventCount: 847,
  isConnected: false,

  // USSD simulation
  simulatedDriver: null,      // { driverId, routeLabel, position:{lat,lng}, waypointIndex, status }
  simulationIntervalId: null,
  mapFlyTarget: null,         // { lat, lng, zoom } — consumed by MapController
  activeSimDriver: null,      // powers the DriverDashboard panel

  setDrivers: (fn) =>
    set((s) => ({ activeDrivers: typeof fn === 'function' ? fn(s.activeDrivers) : fn })),

  setInferredVehicles: (fn) =>
    set((s) => ({ inferredVehicles: typeof fn === 'function' ? fn(s.inferredVehicles) : fn })),

  setRouteEvents: (fn) =>
    set((s) => ({ routeEvents: typeof fn === 'function' ? fn(s.routeEvents) : fn })),

  incrementPassengerCount: (amount = 1) =>
    set((s) => ({ passengerEventCount: s.passengerEventCount + amount })),

  setConnected: (status) => set({ isConnected: status }),

  setMapFlyTarget: (target) => set({ mapFlyTarget: target }),

  startDriverSimulation: (driverId, routeLabel, waypoints) => {
    const prev = get().simulationIntervalId;
    if (prev) clearInterval(prev);

    // Precompute total route distance
    let totalDist = 0;
    for (let i = 1; i < waypoints.length; i++) {
      totalDist += haversineKm(
        waypoints[i - 1].lat, waypoints[i - 1].lng,
        waypoints[i].lat,     waypoints[i].lng,
      );
    }

    set({
      simulatedDriver: { driverId, routeLabel, position: waypoints[0], waypointIndex: 0, status: 'active' },
      activeSimDriver: {
        driverId, routeLabel, waypoints,
        currentWaypointIndex: 0,
        distanceCovered: 0,
        totalDistance: Math.max(totalDist, 0.1),
        speed: 34,
        passengers: 12,
        airtime: 50,
        progress: 0,
        isActive: true,
        startTime: new Date().toISOString(),
        eventLog: [logEntry(`Trip activated — ${routeLabel} corridor`)],
      },
      simulationIntervalId: null,
    });

    toast.success(`New danfo driver activated — ${routeLabel} corridor`, { style: TOAST });

    let step = 0;
    let tick = 0;
    let cumDist = 0;
    const mid = Math.floor(waypoints.length / 2);

    const id = setInterval(() => {
      step += 1;
      tick += 1;

      if (step >= waypoints.length) {
        clearInterval(id);
        set((s) => ({
          simulatedDriver: s.simulatedDriver
            ? { ...s.simulatedDriver, status: 'complete', waypointIndex: step - 1 }
            : null,
          activeSimDriver: s.activeSimDriver
            ? { ...s.activeSimDriver, isActive: false, progress: 100, currentWaypointIndex: step - 1 }
            : null,
          simulationIntervalId: null,
        }));
        toast(`Trip complete — ${routeLabel} · 18 mins · ~12 passengers`, { style: TOAST });
        return;
      }

      const prevWp = waypoints[step - 1];
      const currWp = waypoints[step];
      cumDist += haversineKm(prevWp.lat, prevWp.lng, currWp.lat, currWp.lng);
      const progress = Math.min(100, Math.round((step / (waypoints.length - 1)) * 100));
      const newSpeed = 25 + Math.floor(Math.random() * 21);
      const newPax = 8 + Math.floor(Math.random() * 9);

      // Build event log entries for this tick
      const entries = [];
      if (currWp.name) entries.push(logEntry(`Waypoint passed — ${currWp.name}`));
      entries.push(logEntry(`Location updated — ${currWp.lat.toFixed(4)}, ${currWp.lng.toFixed(4)}`));
      entries.push(logEntry(`Speed recorded — ${newSpeed} km/h`));
      if (tick % 2 === 0) entries.unshift(logEntry(`Passenger count — ~${newPax} onboard`));
      if (tick % 3 === 0) {
        const t1 = (Math.floor(tick / 3) % 3) + 1;
        const t2 = (t1 % 3) + 1;
        entries.unshift(logEntry(`Tower handoff — LAG_00${t1} → LAG_00${t2}`));
      }

      set((s) => ({
        simulatedDriver: s.simulatedDriver
          ? { ...s.simulatedDriver, position: currWp, waypointIndex: step }
          : null,
        activeSimDriver: s.activeSimDriver
          ? {
              ...s.activeSimDriver,
              currentWaypointIndex: step,
              distanceCovered: cumDist,
              progress,
              speed: newSpeed,
              passengers: tick % 2 === 0 ? newPax : s.activeSimDriver.passengers,
              airtime: 50 + step * 50,
              eventLog: [...entries, ...s.activeSimDriver.eventLog].slice(0, 20),
            }
          : null,
      }));

      if (step === mid) {
        toast(`Driver update — ${cumDist.toFixed(1)}km covered on ${routeLabel}`, { style: TOAST });
      }
    }, 3000);

    set({ simulationIntervalId: id });
  },

  stopDriverSimulation: () => {
    const id = get().simulationIntervalId;
    if (id) clearInterval(id);
    set({ simulatedDriver: null, simulationIntervalId: null, activeSimDriver: null });
  },
}));

export default useStore;
