import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../store/useStore';
import { MOCK_GHOST_CORRIDOR_POLYLINES } from '../data/mockData';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [20, 33], iconAnchor: [10, 33], popupAnchor: [0, -33],
});
const amberIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [20, 33], iconAnchor: [10, 33], popupAnchor: [0, -33],
});
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [20, 33], iconAnchor: [10, 33], popupAnchor: [0, -33],
});

const LAYERS_DEFAULT = { drivers: true, vehicles: true, events: true, corridors: true, passengers: true };

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function LiveMap() {
  const [layers, setLayers] = useState(LAYERS_DEFAULT);
  const [passengerDots, setPassengerDots] = useState([]);

  const activeDrivers     = useStore((s) => s.activeDrivers);
  const inferredVehicles  = useStore((s) => s.inferredVehicles);
  const routeEvents       = useStore((s) => s.routeEvents);
  const passengerEventCount = useStore((s) => s.passengerEventCount);

  // Local passenger dot animation — new dot every 800ms, max 30 visible, auto-expire 6s
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const dot = {
        id,
        lat: 6.45 + Math.random() * 0.28,
        lng: 3.30 + Math.random() * 0.38,
      };
      setPassengerDots((prev) => [...prev.slice(-29), dot]);
      setTimeout(() => setPassengerDots((prev) => prev.filter((d) => d.id !== id)), 6000);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const toggle = (key) => setLayers((l) => ({ ...l, [key]: !l[key] }));

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <MapContainer
        center={[6.5244, 3.3792]}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        zoomControl
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        {/* Active Drivers */}
        {layers.drivers && activeDrivers.map((d) =>
          d.lat && d.lng ? (
            <Marker key={d.driverId} position={[d.lat, d.lng]} icon={greenIcon}>
              <Popup>
                <div style={{ minWidth: '150px', background: '#161B22', color: '#E6EDF3' }}>
                  <p style={{ fontFamily: 'monospace', fontSize: '12px', margin: '0 0 4px', color: '#1A6B3C' }}>{d.driverId}</p>
                  <p style={{ fontSize: '12px', margin: '0 0 2px' }}>{d.vehicleType} · {d.homePark}</p>
                  <p style={{ color: '#8B949E', fontSize: '11px', margin: '0 0 2px' }}>{d.currentRoute}</p>
                  <p style={{ color: '#8B949E', fontSize: '11px', fontFamily: 'monospace', margin: 0 }}>
                    {d.tripsToday} trips · ₦{d.earningsToday?.toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}

        {/* Inferred Vehicles */}
        {layers.vehicles && inferredVehicles.map((v) =>
          v.lat && v.lng ? (
            <Marker key={v.vehicleId} position={[v.lat, v.lng]} icon={amberIcon}>
              <Popup>
                <div style={{ minWidth: '150px', background: '#161B22', color: '#E6EDF3' }}>
                  <p style={{ fontFamily: 'monospace', fontSize: '12px', margin: '0 0 4px', color: '#F4A823' }}>{v.vehicleId}</p>
                  <p style={{ fontSize: '12px', margin: '0 0 2px' }}>{v.assignedRoute}</p>
                  <p style={{ color: '#8B949E', fontSize: '11px', fontFamily: 'monospace', margin: 0 }}>
                    Occupancy: {v.estimatedOccupancy} / 18
                  </p>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}

        {/* Driver–vehicle link lines */}
        {layers.vehicles && inferredVehicles.map((v) => {
          if (!v.linkedDriverId || !v.lat || !v.lng) return null;
          const driver = activeDrivers.find((d) => d.driverId === v.linkedDriverId);
          if (!driver?.lat || !driver?.lng) return null;
          return (
            <Polyline
              key={`link-${v.vehicleId}`}
              positions={[[v.lat, v.lng], [driver.lat, driver.lng]]}
              pathOptions={{ color: '#F4A823', weight: 1, opacity: 0.3, dashArray: '4 4' }}
            />
          );
        })}

        {/* Route Events */}
        {layers.events && routeEvents.map((e) =>
          e.lat && e.lng ? (
            <Marker key={e.id} position={[e.lat, e.lng]} icon={redIcon}>
              <Popup>
                <div style={{ minWidth: '170px', background: '#161B22', color: '#E6EDF3' }}>
                  <p style={{ fontFamily: 'monospace', fontSize: '12px', margin: '0 0 4px', color: '#DA3633' }}>
                    {e.eventType}
                  </p>
                  <p style={{ fontSize: '12px', margin: '0 0 2px' }}>{e.location}</p>
                  <p style={{ color: '#8B949E', fontSize: '11px', margin: '0 0 4px' }}>{e.description}</p>
                  <p style={{ color: '#8B949E', fontSize: '10px', fontFamily: 'monospace', margin: 0 }}>
                    {timeAgo(e.timestamp)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}

        {/* Ghost Corridor Polylines */}
        {layers.corridors && MOCK_GHOST_CORRIDOR_POLYLINES.map((c) => (
          <Polyline
            key={c.corridorId}
            positions={c.polyline}
            pathOptions={{ color: '#DA3633', weight: 3, opacity: 0.45, dashArray: '6 4' }}
          />
        ))}

        {/* Passenger Dots */}
        {layers.passengers && passengerDots.map((dot) => (
          <CircleMarker
            key={dot.id}
            center={[dot.lat, dot.lng]}
            radius={4}
            pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.75, weight: 0 }}
            className="fade-dot"
          />
        ))}
      </MapContainer>

      {/* Layer Controls */}
      <div style={{
        position: 'absolute', top: '16px', right: '16px',
        background: '#161B22', border: '1px solid #30363D', borderRadius: '4px',
        padding: '12px 14px', zIndex: 1000, minWidth: '164px',
      }}>
        <p style={{ color: '#8B949E', fontSize: '10px', letterSpacing: '0.08em', margin: '0 0 10px' }}>LAYERS</p>
        {[
          { key: 'drivers',    label: 'Active Drivers',    color: '#1A6B3C' },
          { key: 'vehicles',   label: 'Inferred Vehicles', color: '#F4A823' },
          { key: 'events',     label: 'Route Events',      color: '#DA3633' },
          { key: 'corridors',  label: 'Ghost Corridors',   color: '#DA3633' },
          { key: 'passengers', label: 'Passenger Dots',    color: '#3B82F6' },
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
        position: 'absolute', bottom: '24px', left: '16px',
        background: 'rgba(22,27,34,0.93)', border: '1px solid #30363D',
        borderRadius: '4px', padding: '16px 20px', zIndex: 1000,
        minWidth: '210px', backdropFilter: 'blur(4px)',
      }}>
        <p style={{ color: '#8B949E', fontSize: '10px', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          LIVE NETWORK
        </p>
        {[
          { label: 'Active Drivers',          value: activeDrivers.length,    color: '#1A6B3C' },
          { label: 'Inferred Vehicles',        value: inferredVehicles.length, color: '#F4A823' },
          { label: 'Passenger Events (5m)',    value: passengerEventCount,     color: '#E6EDF3' },
          { label: 'Active Alerts',            value: routeEvents.length,      color: routeEvents.length > 0 ? '#DA3633' : '#E6EDF3' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#8B949E', fontSize: '12px' }}>{label}</span>
            <span style={{ color, fontFamily: 'monospace', fontSize: '14px', fontWeight: 700 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
