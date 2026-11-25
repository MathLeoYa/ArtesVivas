import { useEffect, useState } from 'react';
import { Calendar, MapPin, Radio, Sparkles, Users, Activity } from 'lucide-react';

interface EventItem {
  id: string;
  titulo: string;
  categoria: string;
  estado: string;
  fecha: string;
  horaInicio: string;
  duracionMinutos: number;
  escenario?: { id: string; nombre: string };
  coordenadas: { lat: number; lng: number };
  aforoActual?: number;
  aforoMaximo?: number;
}

interface VenueItem {
  id: string;
  nombre: string;
  tipo: string;
  capacidadMaxima: number;
  esCubierto?: boolean;
  descripcion?: string;
  aforoActual?: number;
}

const FALLBACK_EVENTS: EventItem[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    titulo: 'Danza de los Saraguros',
    categoria: 'danza',
    estado: 'en_vivo',
    fecha: '2026-10-15',
    horaInicio: '19:00',
    duracionMinutos: 60,
    escenario: { id: '11111111-1111-4111-8111-111111111101', nombre: 'Plaza San Sebastián' },
    coordenadas: { lat: -3.9985, lng: -79.1972 },
    aforoActual: 234,
    aforoMaximo: 500
  },
  {
    id: '660e9500-e29b-41d4-a716-556655440001',
    titulo: 'Máscaras y Ritos — Teatro Experimental',
    categoria: 'teatro',
    estado: 'programado',
    fecha: '2026-10-15',
    horaInicio: '20:00',
    duracionMinutos: 90,
    escenario: { id: '11111111-1111-4111-8111-111111111102', nombre: 'Teatro Benjamín Carrión' },
    coordenadas: { lat: -3.997, lng: -79.198 },
    aforoActual: 225,
    aforoMaximo: 300
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440003',
    titulo: 'Máscaras Rituales — Improvisación',
    categoria: 'flash',
    estado: 'en_vivo',
    fecha: '2026-10-15',
    horaInicio: '18:15',
    duracionMinutos: 20,
    escenario: { id: '11111111-1111-4111-8111-111111111103', nombre: 'Calle Lourdes' },
    coordenadas: { lat: -3.9995, lng: -79.196 },
    aforoActual: 145,
    aforoMaximo: 150
  }
];

const FALLBACK_VENUES: VenueItem[] = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    nombre: 'Plaza San Sebastián',
    tipo: 'plaza',
    capacidadMaxima: 500,
    esCubierto: false,
    descripcion: 'Plaza principal del centro histórico de Loja',
    aforoActual: 234
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    nombre: 'Teatro Benjamín Carrión',
    tipo: 'teatro',
    capacidadMaxima: 300,
    esCubierto: true,
    descripcion: 'Teatro principal del festival con aforo cubierto',
    aforoActual: 225
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    nombre: 'Calle Lourdes',
    tipo: 'calle',
    capacidadMaxima: 1000,
    esCubierto: false,
    descripcion: 'Calle peatonal histórica, escenario de flash-performances',
    aforoActual: 420
  }
];

const API_URL = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [tab, setTab] = useState<'events' | 'venues' | 'arch'>('events');
  const [events, setEvents] = useState<EventItem[]>(FALLBACK_EVENTS);
  const [venues, setVenues] = useState<VenueItem[]>(FALLBACK_VENUES);
  const [category, setCategory] = useState<string>('todas');
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    if (!API_URL) return;
    Promise.all([
      fetch(`${API_URL}/api/v1/events`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/v1/venues`).then((r) => (r.ok ? r.json() : null))
    ])
      .then(([evRes, vnRes]) => {
        if (evRes?.data) {
          setEvents(evRes.data);
          setBackendConnected(true);
        }
        if (Array.isArray(vnRes)) {
          setVenues(vnRes);
        }
      })
      .catch(() => setBackendConnected(false));
  }, []);

  const categories = ['todas', 'danza', 'teatro', 'musica', 'flash'];
  const filteredEvents =
    category === 'todas' ? events : events.filter((e) => e.categoria === category);

  const getCapacityLevel = (actual = 0, max = 1) => {
    const pct = (actual / max) * 100;
    if (pct >= 100) return { label: 'rojo (100%)', cls: 'full', color: 'var(--red)', pct: 100 };
    if (pct >= 70) return { label: 'amarillo', cls: 'warn', color: 'var(--yellow)', pct };
    return { label: 'verde', cls: 'live', color: 'var(--green)', pct };
  };

  return (
    <div className="container">
      <header className="header">
        <div>
          <span className="badge">
            <Sparkles size={14} /> FIAVL — Loja, Ecuador
          </span>
          <h1 style={{ fontSize: 28, marginTop: 8 }}>Pulso Loja — Plataforma Cultural</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            Arquitectura Orientada a Eventos (EDA) + Specification-Driven Development (SDD)
          </p>
        </div>
        <span className={`badge ${backendConnected ? 'live' : ''}`}>
          <Activity size={14} />
          {backendConnected ? `API conectada (${API_URL})` : 'Modo Contrato SDD (Mock Local)'}
        </span>
      </header>

      <nav className="tabs">
        <button className={`tab ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>
          <Calendar size={16} /> Cartelera de Eventos
        </button>
        <button className={`tab ${tab === 'venues' ? 'active' : ''}`} onClick={() => setTab('venues')}>
          <MapPin size={16} /> Escenarios & Aforo
        </button>
        <button className={`tab ${tab === 'arch' ? 'active' : ''}`} onClick={() => setTab('arch')}>
          <Radio size={16} /> Specs & Servicios (EDA)
        </button>
      </nav>

      {tab === 'events' && (
        <>
          <div className="filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`chip ${category === cat ? 'selected' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid">
            {filteredEvents.map((ev) => {
              const cap = getCapacityLevel(ev.aforoActual ?? 0, ev.aforoMaximo ?? 100);
              return (
                <article key={ev.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge">{ev.categoria}</span>
                    <span className={`badge ${ev.estado === 'en_vivo' ? 'live' : ''}`}>
                      {ev.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="card-title">{ev.titulo}</h2>
                  <div className="meta">
                    <MapPin size={14} /> {ev.escenario?.nombre ?? 'Ubicación GPS callejera'}
                  </div>
                  <div className="meta">
                    <Calendar size={14} /> {ev.fecha} · {ev.horaInicio} ({ev.duracionMinutos} min)
                  </div>
                  {ev.aforoMaximo && (
                    <div style={{ marginTop: 4 }}>
                      <div className="meta" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>
                          <Users size={13} /> Aforo: {ev.aforoActual ?? 0}/{ev.aforoMaximo}
                        </span>
                        <span>Semáforo: {cap.label}</span>
                      </div>
                      <div className="progress-bg">
                        <div
                          className="progress-bar"
                          style={{ width: `${cap.pct}%`, background: cap.color }}
                        />
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}

      {tab === 'venues' && (
        <div className="grid">
          {venues.map((v) => {
            const cap = getCapacityLevel(v.aforoActual ?? 0, v.capacidadMaxima);
            return (
              <article key={v.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="badge">{v.tipo}</span>
                  <span className={`badge ${cap.cls}`}>
                    {v.esCubierto ? 'Cubierto' : 'Al aire libre'}
                  </span>
                </div>
                <h2 className="card-title">{v.nombre}</h2>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>{v.descripcion}</p>
                <div style={{ marginTop: 6 }}>
                  <div className="meta" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Ocupación actual</span>
                    <span>
                      {v.aforoActual ?? 0} / {v.capacidadMaxima} ({Math.round(cap.pct)}%)
                    </span>
                  </div>
                  <div className="progress-bg">
                    <div
                      className="progress-bar"
                      style={{ width: `${cap.pct}%`, background: cap.color }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {tab === 'arch' && (
        <div className="grid">
          <div className="card">
            <span className="badge">Spec 1 — OpenAPI 3.1</span>
            <h2 className="card-title">Catalog Service</h2>
            <p className="meta">Gestión de eventos, escenarios, agenda y GeoJSON para el mapa.</p>
          </div>
          <div className="card">
            <span className="badge">Spec 2 — OpenAPI 3.1</span>
            <h2 className="card-title">Gamification Service</h2>
            <p className="meta">Pasaporte cultural digital, sellos (100m) y Aplausómetro (200m).</p>
          </div>
          <div className="card">
            <span className="badge">Spec 3 — AsyncAPI 3.0</span>
            <h2 className="card-title">Live Telemetry Service</h2>
            <p className="meta">Streaming WebSocket en tiempo real desde Redis Pub/Sub.</p>
          </div>
          <div className="card">
            <span className="badge">Spec 4 — Gherkin BDD</span>
            <h2 className="card-title">5 Features · 42 Escenarios</h2>
            <p className="meta">Aforo, flash-performances, clima, aplausómetro y pasaporte.</p>
          </div>
        </div>
      )}
    </div>
  );
}
