import { create } from 'zustand';
import toast from 'react-hot-toast';

const TOAST = { background: '#161B22', color: '#E6EDF3', border: '1px solid #1A6B3C', fontSize: '13px' };

export const useStore = create((set, get) => ({
  activeDrivers: [],
  inferredVehicles: [],
  routeEvents: [],
  passengerEventCount: 847,
  isConnected: false,

  // USSD simulation
  simulatedDriver: null,      // { driverId, routeLabel, position:{lat,lng}, waypointIndex, status:'active'|'complete' }
  simulationIntervalId: null,
  mapFlyTarget: null,         // { lat, lng, zoom } — consumed by MapController

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
    // Clear any running simulation
    const prev = get().simulationIntervalId;
    if (prev) clearInterval(prev);

    set({
      simulatedDriver: { driverId, routeLabel, position: waypoints[0], waypointIndex: 0, status: 'active' },
      simulationIntervalId: null,
    });

    toast.success(`New danfo driver activated — ${routeLabel} corridor`, { style: TOAST });

    let step = 0;
    const mid = Math.floor(waypoints.length / 2);

    const id = setInterval(() => {
      step += 1;

      if (step >= waypoints.length) {
        clearInterval(id);
        set((s) => ({
          simulatedDriver: s.simulatedDriver
            ? { ...s.simulatedDriver, status: 'complete', waypointIndex: step - 1 }
            : null,
          simulationIntervalId: null,
        }));
        toast(`Trip complete — ${routeLabel} · 18 mins · ~12 passengers`, { style: TOAST });
        return;
      }

      set((s) => ({
        simulatedDriver: s.simulatedDriver
          ? { ...s.simulatedDriver, position: waypoints[step], waypointIndex: step }
          : null,
      }));

      if (step === mid) {
        toast(`Driver update — 2.3km covered on ${routeLabel}`, { style: TOAST });
      }
    }, 3000);

    set({ simulationIntervalId: id });
  },

  stopDriverSimulation: () => {
    const id = get().simulationIntervalId;
    if (id) clearInterval(id);
    set({ simulatedDriver: null, simulationIntervalId: null });
  },
}));

export default useStore;
