import { useEffect, useState } from 'react';
import {
  Activity,
  Award,
  Calendar,
  CloudRain,
  Flame,
  Map as MapIcon,
  MapPin,
  Radio,
  Sparkles,
  Star,
  Users,
  Zap
} from 'lucide-react';
import LojaMap, { MapFeature } from './LojaMap';

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
  esFlash?: boolean;
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

interface VoteStat {
  eventoId: string;
  totalVotos: number;
  promedio: number;
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
    aforoMaximo: 150,
    esFlash: true
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
  const [tab, setTab] = useState<'events' | 'map' | 'venues' | 'gamification' | 'arch'>('events');
  const [events, setEvents] = useState<EventItem[]>(FALLBACK_EVENTS);
  const [venues, setVenues] = useState<VenueItem[]>(FALLBACK_VENUES);
  const [mapFeatures, setMapFeatures] = useState<MapFeature[]>([]);
  const [votes, setVotes] = useState<Record<string, VoteStat>>({
    '550e8400-e29b-41d4-a716-446655440000': {
      eventoId: '550e8400-e29b-41d4-a716-446655440000',
      totalVotos: 42,
      promedio: 4.71
    },
    '880e8400-e29b-41d4-a716-446655440003': {
      eventoId: '880e8400-e29b-41d4-a716-446655440003',
      totalVotos: 28,
      promedio: 4.79
    }
  });
  const [stampedVenues, setStampedVenues] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('todas');
  const [backendConnected, setBackendConnected] = useState(false);
  const [flashName, setFlashName] = useState('');
  const [weatherAlert, setWeatherAlert] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const syncFromBackend = () => {
    if (!API_URL) return;
    Promise.all([
      fetch(`${API_URL}/api/v1/events`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/v1/venues`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/v1/map/points`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/v1/votes/live`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/v1/passport`).then((r) => (r.ok ? r.json() : null))
    ])
      .then(([evRes, vnRes, mapRes, votesRes, passRes]) => {
        if (evRes?.data) {
          setEvents(evRes.data);
          setBackendConnected(true);
        }
        if (Array.isArray(vnRes)) setVenues(vnRes);
        if (mapRes?.features) setMapFeatures(mapRes.features);
        if (Array.isArray(votesRes)) {
          const next: Record<string, VoteStat> = {};
          votesRes.forEach((v: VoteStat) => {
            next[v.eventoId] = v;
          });
          setVotes(next);
        }
        if (passRes?.sellos) setStampedVenues(passRes.sellos);
      })
      .catch(() => setBackendConnected(false));
  };

  useEffect(() => {
    syncFromBackend();
  }, []);

  useEffect(() => {
    if (!backendConnected) {
      setMapFeatures(
        events.map((ev) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [ev.coordenadas.lng, ev.coordenadas.lat] },
          properties: {
            id: ev.id,
            tipo: ev.esFlash ? 'flash' : 'evento',
            titulo: ev.titulo,
            estado: ev.estado,
            nivelAforo: 'verde'
          }
        }))
      );
    }
  }, [events, backendConnected]);

  const handleCastVote = async (eventoId: string, calificacion: number) => {
    if (backendConnected && API_URL) {
      const res = await fetch(`${API_URL}/api/v1/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId, calificacion })
      });
      if (res.ok) {
        const updated: VoteStat = await res.json();
        setVotes((prev) => ({ ...prev, [eventoId]: updated }));
        showToast(`¡Voto de ${calificacion}★ registrado! Promedio en vivo: ${updated.promedio}`);
        return;
      }
    }
    setVotes((prev) => {
      const cur = prev[eventoId] ?? { eventoId, totalVotos: 0, promedio: 0 };
      const totalVotos = cur.totalVotos + 1;
      const promedio = Number(((cur.promedio * cur.totalVotos + calificacion) / totalVotos).toFixed(2));
      return { ...prev, [eventoId]: { eventoId, totalVotos, promedio } };
    });
    showToast(`¡Voto de ${calificacion}★ registrado en el Aplausómetro!`);
  };

  const handleStamp = async (escenarioId: string, nombre: string) => {
    if (stampedVenues.includes(escenarioId)) {
      showToast(`Ya tienes el sello de ${nombre} (409 STAMP_ALREADY_EXISTS)`);
      return;
    }
    if (backendConnected && API_URL) {
      const res = await fetch(`${API_URL}/api/v1/passport/stamp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escenarioId })
      });
      if (res.ok) {
        const data = await res.json();
        setStampedVenues(data.sellos);
        showToast(
          data.badgeDesbloqueado
            ? `🏅 ¡Badge desbloqueado: ${data.badgeDesbloqueado.nombre}!`
            : `✅ Sello de ${nombre} agregado (+50 pts)`
        );
        return;
      }
    }
    const next = [...stampedVenues, escenarioId];
    setStampedVenues(next);
    showToast(
      next.length >= 3
        ? '🏅 ¡Badge desbloqueado: Explorador Andino!'
        : `✅ Sello de ${nombre} agregado (+50 pts)`
    );
  };

  const handleCreateFlash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (flashName.trim().length < 3) return;
    if (backendConnected && API_URL) {
      const res = await fetch(`${API_URL}/api/v1/events/flash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: flashName, duracionEstimadaMinutos: 25 })
      });
      if (res.ok) {
        setFlashName('');
        syncFromBackend();
        showToast('⚡ Flash Performance publicada y visible en el Mapa de Loja');
        return;
      }
    }
    const created: EventItem = {
      id: crypto.randomUUID(),
      titulo: flashName.trim(),
      categoria: 'flash',
      estado: 'en_vivo',
      fecha: new Date().toISOString().slice(0, 10),
      horaInicio: new Date().toTimeString().slice(0, 5),
      duracionMinutos: 25,
      escenario: { id: '11111111-1111-4111-8111-111111111103', nombre: 'Centro Histórico de Loja' },
      coordenadas: {
        lat: -3.9982 + (Math.random() - 0.5) * 0.002,
        lng: -79.197 + (Math.random() - 0.5) * 0.002
      },
      aforoActual: 15,
      aforoMaximo: 150,
      esFlash: true
    };
    setEvents((prev) => [created, ...prev]);
    setFlashName('');
    showToast('⚡ Flash Performance publicada');
  };

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
      {toast && <div className="toast">{toast}</div>}

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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="chip" onClick={() => setWeatherAlert((v) => !v)}>
            <CloudRain size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
            {weatherAlert ? 'Desactivar Alerta Clima' : 'Simular Alerta Lluvia'}
          </button>
          <span className={`badge ${backendConnected ? 'live' : ''}`}>
            <Activity size={14} />
            {backendConnected ? `API conectada (${API_URL})` : 'Modo Contrato SDD (Mock Local)'}
          </span>
        </div>
      </header>

      {weatherAlert && (
        <div className="alert-banner">
          <CloudRain size={18} />
          <div>
            <strong>WeatherAlert (Spec 3 — AsyncAPI):</strong> Lluvia moderada detectada en el centro
            de Loja. Los eventos al aire libre se reubican hacia{' '}
            <strong>Teatro Benjamín Carrión</strong> (cubierto, aforo disponible).
          </div>
        </div>
      )}

      <nav className="tabs">
        <button className={`tab ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>
          <Calendar size={16} /> Cartelera de Eventos
        </button>
        <button className={`tab ${tab === 'map' ? 'active' : ''}`} onClick={() => setTab('map')}>
          <MapIcon size={16} /> Mapa de Loja
        </button>
        <button className={`tab ${tab === 'venues' ? 'active' : ''}`} onClick={() => setTab('venues')}>
          <MapPin size={16} /> Escenarios & Aforo
        </button>
        <button
          className={`tab ${tab === 'gamification' ? 'active' : ''}`}
          onClick={() => setTab('gamification')}
        >
          <Flame size={16} /> Aplausómetro & Pasaporte
        </button>
        <button className={`tab ${tab === 'arch' ? 'active' : ''}`} onClick={() => setTab('arch')}>
          <Radio size={16} /> Specs & Servicios (EDA)
        </button>
      </nav>

      {tab === 'events' && (
        <>
          <form className="flash-form" onSubmit={handleCreateFlash}>
            <Zap size={16} color="var(--accent)" />
            <input
              type="text"
              placeholder="Anunciar Flash Performance callejera en Loja..."
              value={flashName}
              onChange={(e) => setFlashName(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Publicar Flash
            </button>
          </form>

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

      {tab === 'map' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <strong>Mapa Interactivo — Centro Histórico de Loja (GeoJSON /api/v1/map/points)</strong>
              <span className="meta">🟢 Evento oficial &nbsp;·&nbsp; 🟠 Flash Performance</span>
            </div>
          </div>
          <LojaMap features={mapFeatures} />
        </div>
      )}

      {tab === 'venues' && (
        <div className="grid">
          {venues.map((v) => {
            const cap = getCapacityLevel(v.aforoActual ?? 0, v.capacidadMaxima);
            const stamped = stampedVenues.includes(v.id);
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
                <button
                  className={stamped ? 'chip selected' : 'btn-primary'}
                  style={{ marginTop: 8 }}
                  onClick={() => handleStamp(v.id, v.nombre)}
                >
                  {stamped ? '✓ Escenario Sellado (+50 pts)' : 'Sellar en Pasaporte (100m)'}
                </button>
              </article>
            );
          })}
        </div>
      )}

      {tab === 'gamification' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span className="badge">
                  <Award size={14} /> Spec 2 — Pasaporte Cultural Digital
                </span>
                <h2 className="card-title" style={{ marginTop: 8 }}>
                  Puntos acumulados: {stampedVenues.length * 50} pts ({stampedVenues.length}/3 sellos)
                </h2>
                <p className="meta">
                  Visita los escenarios del festival para sellar tu pasaporte y desbloquear insignias.
                </p>
              </div>
              {stampedVenues.length >= 3 ? (
                <span className="badge live" style={{ alignSelf: 'center', fontSize: 14, padding: '8px 14px' }}>
                  🏅 Badge Desbloqueado: Explorador Andino
                </span>
              ) : (
                <span className="badge" style={{ alignSelf: 'center' }}>
                  Te faltan {3 - stampedVenues.length} sellos para Explorador Andino
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              {venues.map((v) => {
                const stamped = stampedVenues.includes(v.id);
                return (
                  <button
                    key={v.id}
                    className={stamped ? 'chip selected' : 'chip'}
                    onClick={() => handleStamp(v.id, v.nombre)}
                  >
                    {stamped ? `✓ ${v.nombre}` : `+ Sellar ${v.nombre}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>
              <Flame size={18} style={{ verticalAlign: 'middle', color: 'var(--accent)', marginRight: 6 }} />
              Aplausómetro en Vivo (Eventos en curso)
            </h2>
            <div className="grid">
              {events
                .filter((e) => e.estado === 'en_vivo')
                .map((ev) => {
                  const st = votes[ev.id] ?? { totalVotos: 0, promedio: 0 };
                  return (
                    <article key={ev.id} className="card">
                      <span className="badge live">en vivo</span>
                      <h3 className="card-title">{ev.titulo}</h3>
                      <div className="meta">
                        <Star size={14} color="var(--accent)" /> Promedio: <strong>{st.promedio}</strong> ({st.totalVotos} votos)
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            className="chip"
                            onClick={() => handleCastVote(ev.id, n)}
                          >
                            {n}★
                          </button>
                        ))}
                      </div>
                    </article>
                  );
                })}
            </div>
          </div>
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
