import { create } from 'zustand';

export const useStore = create((set) => ({
  activeDrivers: [],
  inferredVehicles: [],
  routeEvents: [],
  passengerEventCount: 847,
  isConnected: false,

  setDrivers: (driversOrUpdater) =>
    set((state) => ({
      activeDrivers: typeof driversOrUpdater === 'function'
        ? driversOrUpdater(state.activeDrivers)
        : driversOrUpdater,
    })),

  setInferredVehicles: (vehiclesOrUpdater) =>
    set((state) => ({
      inferredVehicles: typeof vehiclesOrUpdater === 'function'
        ? vehiclesOrUpdater(state.inferredVehicles)
        : vehiclesOrUpdater,
    })),

  setRouteEvents: (eventsOrUpdater) =>
    set((state) => ({
      routeEvents: typeof eventsOrUpdater === 'function'
        ? eventsOrUpdater(state.routeEvents)
        : eventsOrUpdater,
    })),

  incrementPassengerCount: (amount = 1) =>
    set((state) => ({ passengerEventCount: state.passengerEventCount + amount })),

  setConnected: (status) => set({ isConnected: status }),
}));

export default useStore;
