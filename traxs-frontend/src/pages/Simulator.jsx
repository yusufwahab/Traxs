import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { MOCK_BEDROCK_RESPONSES } from '../data/mockData';
import USSDSimulator from '../components/USSDSimulator';
import DriverDashboard from '../components/DriverDashboard';

const API = import.meta.env.VITE_API_BASE_URL;

const VEHICLE_TYPES = ['danfo', 'keke', 'okada'];
const HOME_PARKS    = ['Oshodi', 'Ikeja', 'CMS', 'Lekki', 'Ikorodu'];
const EVENT_TYPES   = ['road_blocked', 'police_checkpoint', 'flooding', 'accident', 'long_queue'];
const EVENT_LABELS  = { road_blocked: 'Road Block', police_checkpoint: 'Checkpoint', flooding: 'Flooding', accident: 'Accident', long_queue: 'Long Queue' };

const CORRIDORS = [
  { label: 'Ikorodu → Owutu',    bounds: { lat: [6.53, 6.62], lng: [3.49, 3.56] } },
  { label: 'CMS → Lekki Phase 2', bounds: { lat: [6.42, 6.46], lng: [3.38, 3.57] } },
  { label: 'Oshodi → Ikeja',      bounds: { lat: [6.54, 6.60], lng: [3.33, 3.36] } },
  { label: 'Festac → Mile 2',     bounds: { lat: [6.46, 6.48], lng: [3.26, 3.32] } },
  { label: 'Agege → Ikeja',       bounds: { lat: [6.60, 6.63], lng: [3.30, 3.36] } },
];

const BEDROCK_CHIPS = [
  'Which area of Lagos has the highest unmet demand right now?',
  'What is the load factor on the Lekki corridor today?',
  'Which LGA has the worst transit access?',
];

const TOAST_SUCCESS = { background: '#161B22', color: '#E6EDF3', border: '1px solid #1A6B3C', fontSize: '13px' };
const TOAST_WARN    = { background: '#161B22', color: '#E6EDF3', border: '1px solid #30363D', fontSize: '13px' };

function rand(min, max) { return min + Math.random() * (max - min); }

function Section({ title, children }) {
  return (
    <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '24px' }}>
      <p style={{ color: '#8B949E', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 20px' }}>{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ color: '#8B949E', fontSize: '11px', display: 'block', marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { background: '#0D1117', border: '1px solid #30363D', color: '#E6EDF3', padding: '8px 10px', fontSize: '13px', borderRadius: '2px', width: '100%' };
const btn = (disabled) => ({ background: disabled ? '#1e2530' : '#1A6B3C', color: '#E6EDF3', border: 'none', padding: '9px 20px', fontSize: '13px', cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: '2px', opacity: disabled ? 0.6 : 1, whiteSpace: 'nowrap' });

export default function Simulator() {
  const { setDrivers, setRouteEvents, incrementPassengerCount } = useStore();

  const [activeDriverId, setActiveDriverId] = useState(null);
  const [driver, setDriver]     = useState({ phone: '', vehicleType: 'danfo', homePark: 'Oshodi' });
  const [driverLoading, setDL]  = useState(false);

  const [pax, setPax]           = useState({ count: 10, corridorIdx: 0 });
  const [paxLoading, setPaxL]   = useState(false);

  const [evt, setEvt]           = useState({ eventType: EVENT_TYPES[0], description: '' });
  const [evtLoading, setEvtL]   = useState(false);

  const [question, setQuestion]       = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [askLoading, setAskL]         = useState(false);

  // Grab a seed driver to use for route event reports
  useEffect(() => {
    fetch(`${API}/api/drivers/active`)
      .then(r => r.json())
      .then(json => { if (json.success && json.data.length > 0) setActiveDriverId(json.data[0].driverId); })
      .catch(() => {});
  }, []);

  /* ── Section 1: Spawn Driver ── */
  const spawnDriver = async () => {
    if (!driver.phone.trim()) return;
    setDL(true);
    try {
      const res = await fetch(`${API}/api/drivers/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: driver.phone, deviceType: 'smartphone', vehicleType: driver.vehicleType, homePark: driver.homePark }),
      });
      const json = await res.json();
      if (json.success) {
        const newDriver = {
          driverId: json.data.driverId,
          phoneNumber: driver.phone,
          vehicleType: driver.vehicleType,
          homepark: driver.homePark,
          isActive: true,
          lat: 6.5244 + (Math.random() - 0.5) * 0.12,
          lng: 3.3792 + (Math.random() - 0.5) * 0.12,
          currentRoute: `${driver.homePark} → Lagos`,
          tripsToday: 0,
          earningsToday: 0,
        };
        setDrivers(prev => [...prev, newDriver]);
        if (!activeDriverId) setActiveDriverId(json.data.driverId);
        toast.success(`${driver.vehicleType} activated — ${driver.homePark} corridor`, { style: TOAST_SUCCESS });
      }
    } catch (err) {
      toast.error('Failed to activate driver', { style: TOAST_WARN });
    } finally {
      setDL(false);
    }
  };

  /* ── Section 2: Passenger Events ── */
  const sendPassengerEvents = async () => {
    const corridor = CORRIDORS[pax.corridorIdx];
    setPaxL(true);
    try {
      const sends = Array.from({ length: pax.count }, (_, i) => {
        const lat = rand(corridor.bounds.lat[0], corridor.bounds.lat[1]);
        const lng = rand(corridor.bounds.lng[0], corridor.bounds.lng[1]);
        return fetch(`${API}/api/passengers/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: `SIM-${Date.now()}-${i}`,
            lat, lng,
            speed: rand(10, 35),
            heading: rand(0, 360),
            motionType: 'bus',
          }),
        });
      });
      await Promise.allSettled(sends);
      incrementPassengerCount(pax.count);
      toast.success(`${pax.count} passenger events sent — ${corridor.label}`, { style: TOAST_SUCCESS });
    } catch (err) {
      toast.error('Some events failed to send', { style: TOAST_WARN });
    } finally {
      setPaxL(false);
    }
  };

  /* ── Section 3: Route Event ── */
  const submitRouteEvent = async () => {
    setEvtL(true);
    const driverId = activeDriverId || 'DRV-SEED-001';
    const lat = 6.45 + Math.random() * 0.25;
    const lng = 3.30 + Math.random() * 0.35;
    try {
      const res = await fetch(`${API}/api/drivers/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, eventType: evt.eventType, lat, lng, description: evt.description || `${EVENT_LABELS[evt.eventType]} reported via simulator` }),
      });
      const json = await res.json();
      if (json.success) {
        setRouteEvents(prev => [{
          eventId: json.data.eventId,
          eventType: evt.eventType,
          description: json.data.description,
          timestamp: json.data.timestamp,
          lat, lng,
          isActive: true,
        }, ...prev]);
        toast(`⚠️ ${EVENT_LABELS[evt.eventType]} reported`, { duration: 5000, style: TOAST_WARN });
      }
    } catch (err) {
      toast.error('Failed to submit route event', { style: TOAST_WARN });
    } finally {
      setEvtL(false);
    }
  };

  /* ── Section 4: Ask TRAXS (Bedrock) ── */
  const askTraxs = async (q) => {
    const text = (q || question).trim();
    if (!text) return;
    setAskL(true);
    setChatHistory(h => [...h, { role: 'user', text }]);
    setQuestion('');
    try {
      const res = await fetch(`${API}/api/intelligence/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });
      const json = await res.json();
      const answer = json.data?.answer
        || MOCK_BEDROCK_RESPONSES[text]
        || 'Based on TRAXS historical data: Ikorodu–Owutu has the highest unmet demand (score 94/18), CMS–Lekki operates at 68% load factor, and Ikorodu LGA has the lowest transit access score at 29/100.';
      setChatHistory(h => [...h, { role: 'assistant', text: answer }]);
    } catch {
      const fallback = MOCK_BEDROCK_RESPONSES[text]
        || 'Based on TRAXS historical data: Ikorodu–Owutu has the highest unmet demand (score 94/18), CMS–Lekki operates at 68% load factor, and Ikorodu LGA has the lowest transit access score at 29/100.';
      setChatHistory(h => [...h, { role: 'assistant', text: fallback }]);
    } finally {
      setAskL(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#E6EDF3', margin: 0 }}>Demo Simulator</h1>
        <p style={{ color: '#8B949E', fontSize: '13px', margin: '4px 0 0' }}>
          Internal control panel — trigger live events for demo day
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* USSD Phone + Driver Dashboard — 2-column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '32px 24px', display: 'flex', justifyContent: 'center' }}>
            <USSDSimulator />
          </div>
          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '20px' }}>
            <DriverDashboard />
          </div>
        </div>

        {/* Section 1 */}
        <Section title="SPAWN DRIVER">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
            <Field label="PHONE NUMBER">
              <input value={driver.phone} onChange={e => setDriver(d => ({ ...d, phone: e.target.value }))} placeholder="+234..." style={inputStyle} />
            </Field>
            <Field label="VEHICLE TYPE">
              <select value={driver.vehicleType} onChange={e => setDriver(d => ({ ...d, vehicleType: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="HOME PARK">
              <select value={driver.homePark} onChange={e => setDriver(d => ({ ...d, homePark: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                {HOME_PARKS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <button onClick={spawnDriver} disabled={driverLoading || !driver.phone.trim()} style={btn(driverLoading || !driver.phone.trim())}>
              {driverLoading ? 'Activating...' : 'Activate Driver'}
            </button>
          </div>
        </Section>

        {/* Section 2 */}
        <Section title="SIMULATE PASSENGER MOVEMENT">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
            <Field label={`PASSENGER EVENTS: ${pax.count}`}>
              <input type="range" min={1} max={50} value={pax.count} onChange={e => setPax(p => ({ ...p, count: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#1A6B3C', marginTop: '8px' }} />
            </Field>
            <Field label="CORRIDOR">
              <select value={pax.corridorIdx} onChange={e => setPax(p => ({ ...p, corridorIdx: Number(e.target.value) }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                {CORRIDORS.map((c, i) => <option key={i} value={i}>{c.label}</option>)}
              </select>
            </Field>
            <button onClick={sendPassengerEvents} disabled={paxLoading} style={btn(paxLoading)}>
              {paxLoading ? 'Sending...' : 'Send Events'}
            </button>
          </div>
        </Section>

        {/* Section 3 */}
        <Section title="REPORT A ROUTE EVENT">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
            <Field label="EVENT TYPE">
              <select value={evt.eventType} onChange={e => setEvt(v => ({ ...v, eventType: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{EVENT_LABELS[t]}</option>)}
              </select>
            </Field>
            <Field label="DESCRIPTION (OPTIONAL)">
              <input value={evt.description} onChange={e => setEvt(v => ({ ...v, description: e.target.value }))} placeholder="Optional details..." style={inputStyle} />
            </Field>
            <button onClick={submitRouteEvent} disabled={evtLoading} style={btn(evtLoading)}>
              {evtLoading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </Section>

        {/* Section 4 */}
        <Section title="ASK TRAXS — BEDROCK INTELLIGENCE">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {BEDROCK_CHIPS.map(chip => (
              <button key={chip} onClick={() => askTraxs(chip)} disabled={askLoading}
                style={{ background: '#0D1117', border: '1px solid #30363D', color: '#8B949E', fontSize: '12px', padding: '5px 10px', cursor: 'pointer', borderRadius: '2px' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#E6EDF3'; e.currentTarget.style.borderColor = '#8B949E'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#8B949E'; e.currentTarget.style.borderColor = '#30363D'; }}>
                {chip}
              </button>
            ))}
          </div>

          {chatHistory.length > 0 && (
            <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: '4px', padding: '16px', marginBottom: '16px', maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatHistory.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <span style={{ color: '#8B949E', fontSize: '10px', letterSpacing: '0.06em' }}>{msg.role === 'user' ? 'YOU' : 'TRAXS'}</span>
                  <div style={{ background: msg.role === 'user' ? '#1e2530' : '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '10px 14px', color: '#E6EDF3', fontSize: '13px', lineHeight: '1.6', maxWidth: '85%' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {askLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: '#8B949E', fontSize: '10px' }}>TRAXS</span>
                  <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '10px 14px' }}>
                    <span style={{ color: '#8B949E', fontSize: '13px', fontFamily: 'monospace' }}>Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && askTraxs()}
              placeholder="Ask anything about Lagos mobility..." style={{ ...inputStyle, flex: 1 }} disabled={askLoading} />
            <button onClick={() => askTraxs()} disabled={askLoading || !question.trim()} style={btn(askLoading || !question.trim())}>Ask</button>
          </div>
        </Section>
      </div>
    </div>
  );
}
