import { useEffect, useState } from 'react';
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  CloudRain,
  Compass,
  Flame,
  Map as MapIcon,
  MapPin,
  Music,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Theater,
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

const CATEGORY_IMAGES: Record<string, string> = {
  danza: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&w=800&q=80',
  teatro: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=800&q=80',
  musica: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  flash: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80'
};

const CATEGORY_EMOJI: Record<string, string> = {
  danza: '💃',
  teatro: '🎭',
  musica: '🎵',
  flash: '⚡'
};

const VENUE_EMOJI: Record<string, string> = {
  plaza: '🏛️',
  teatro: '🎭',
  calle: '🎨'
};

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
    id: '770e8400-e29b-41d4-a716-446655440002',
    titulo: 'Sinfonía Andina en Vivo',
    categoria: 'musica',
    estado: 'programado',
    fecha: '2026-10-15',
    horaInicio: '21:00',
    duracionMinutos: 75,
    escenario: { id: '11111111-1111-4111-8111-111111111101', nombre: 'Plaza San Sebastián' },
    coordenadas: { lat: -3.9987, lng: -79.1975 },
    aforoActual: 180,
    aforoMaximo: 500
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
    descripcion: 'Plaza principal del centro histórico de Loja, corazón del festival.',
    aforoActual: 234
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    nombre: 'Teatro Benjamín Carrión',
    tipo: 'teatro',
    capacidadMaxima: 300,
    esCubierto: true,
    descripcion: 'Teatro principal del festival con acústica de primera y aforo cubierto.',
    aforoActual: 225
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    nombre: 'Calle Lourdes',
    tipo: 'calle',
    capacidadMaxima: 1000,
    esCubierto: false,
    descripcion: 'Calle peatonal histórica, escenario vibrante de flash-performances.',
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
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [syncing, setSyncing] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const syncFromBackend = () => {
    if (!API_URL) return;
    setSyncing(true);
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
      .catch(() => setBackendConnected(false))
      .finally(() => setSyncing(false));
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
      try {
        const res = await fetch(`${API_URL}/api/v1/votes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventoId, calificacion })
        });
        if (res.ok) {
          const updated: VoteStat = await res.json();
          setVotes((prev) => ({ ...prev, [eventoId]: updated }));
          showToast(`¡Aplauso de ${calificacion}★ registrado! Promedio en vivo: ${updated.promedio}`);
          return;
        }
      } catch {
        // Fallback local si hay error de red
      }
    }
    setVotes((prev) => {
      const cur = prev[eventoId] ?? { eventoId, totalVotos: 0, promedio: 0 };
      const totalVotos = cur.totalVotos + 1;
      const promedio = Number(((cur.promedio * cur.totalVotos + calificacion) / totalVotos).toFixed(2));
      return { ...prev, [eventoId]: { eventoId, totalVotos, promedio } };
    });
    showToast(`¡Aplauso de ${calificacion}★ registrado en el Aplausómetro!`);
  };

  const handleStamp = async (escenarioId: string, nombre: string) => {
    if (stampedVenues.includes(escenarioId)) {
      showToast(`Ya tienes el sello de ${nombre} (409 STAMP_ALREADY_EXISTS)`);
      return;
    }
    if (backendConnected && API_URL) {
      try {
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
      } catch {
        // Fallback local
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
      try {
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
      } catch {
        // Fallback local
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
    const pct = Math.min(100, (actual / max) * 100);
    if (pct >= 100) return { label: 'Lleno (100%)', color: 'var(--red)', pct: 100 };
    if (pct >= 70) return { label: 'Aforo alto', color: 'var(--yellow)', pct };
    return { label: 'Disponible', color: 'var(--green)', pct };
  };

  const getCategoryBadgeClass = (cat: string) => {
    if (cat === 'danza') return 'cat-danza';
    if (cat === 'teatro') return 'cat-teatro';
    if (cat === 'musica') return 'cat-musica';
    if (cat === 'flash') return 'cat-flash';
    return 'cat-default';
  };

  return (
    <div className="container">
      {toast && <div className="toast">{toast}</div>}

      {/* ===== Hero Header ===== */}
      <header className="hero-banner">
        <div className="hero-inner">
          <div className="hero-top-row">
            <div>
              <span className="hero-badge">
                <Sparkles size={14} /> FIAVL — Festival Internacional de Artes Vivas de Loja
              </span>
              <h1 className="hero-title">Pulso Loja — Plataforma Cultural</h1>
              <p className="hero-subtitle">
                Cartelera interactiva en tiempo real · Pasaporte Cultural · Mapa GeoJSON
              </p>
            </div>

            <div className="hero-actions">
              <button
                className={`btn-hero ${weatherAlert ? 'primary' : 'outline'}`}
                onClick={() => setWeatherAlert((v) => !v)}
              >
                <CloudRain size={15} />
                {weatherAlert ? 'Desactivar Alerta Clima' : 'Simular Alerta Lluvia'}
              </button>

              {API_URL && (
                <button
                  className="btn-hero outline"
                  onClick={syncFromBackend}
                  title="Sincronizar con el servidor"
                >
                  <RefreshCw size={15} className={syncing ? 'spin' : ''} />
                  Actualizar
                </button>
              )}

              <span className={`api-status ${backendConnected ? 'connected' : 'disconnected'}`}>
                <span className="dot" />
                {backendConnected ? 'API en Vivo (Render)' : 'Modo Contrato SDD'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Weather Alert Banner ===== */}
      {weatherAlert && (
        <div className="alert-banner">
          <CloudRain size={22} />
          <div>
            <strong>Alerta Meteorológica (Spec 3 — AsyncAPI):</strong> Lluvia moderada detectada en
            el centro de Loja. Los eventos al aire libre se reubican automáticamente hacia el{' '}
            <strong>Teatro Benjamín Carrión</strong> (escenario cubierto con aforo disponible).
          </div>
        </div>
      )}

      {/* ===== Navigation Tabs ===== */}
      <nav className="tabs">
        <button className={`tab ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>
          <Calendar size={17} /> Cartelera
        </button>
        <button className={`tab ${tab === 'map' ? 'active' : ''}`} onClick={() => setTab('map')}>
          <MapIcon size={17} /> Mapa de Loja
        </button>
        <button className={`tab ${tab === 'venues' ? 'active' : ''}`} onClick={() => setTab('venues')}>
          <MapPin size={17} /> Escenarios & Aforo
        </button>
        <button
          className={`tab ${tab === 'gamification' ? 'active' : ''}`}
          onClick={() => setTab('gamification')}
        >
          <Flame size={17} /> Aplausómetro & Pasaporte
        </button>
        <button className={`tab ${tab === 'arch' ? 'active' : ''}`} onClick={() => setTab('arch')}>
          <Radio size={17} /> Arquitectura & Specs
        </button>
      </nav>

      {/* ===== TAB 1: CARTELERA DE EVENTOS ===== */}
      {tab === 'events' && (
        <>
          <form className="flash-form" onSubmit={handleCreateFlash}>
            <div className="section-icon orange" style={{ width: 38, height: 38 }}>
              <Zap size={18} />
            </div>
            <input
              type="text"
              placeholder="¿Viste un artista callejero? Anuncia una Flash Performance en Loja..."
              value={flashName}
              onChange={(e) => setFlashName(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              ⚡ Publicar Flash
            </button>
          </form>

          <div className="filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`chip ${category === cat ? 'selected' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {CATEGORY_EMOJI[cat] ? `${CATEGORY_EMOJI[cat]} ` : '✨ '}
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid">
            {filteredEvents.map((ev) => {
              const cap = getCapacityLevel(ev.aforoActual ?? 0, ev.aforoMaximo ?? 100);
              const imgUrl = CATEGORY_IMAGES[ev.categoria];
              const showFallback = !imgUrl || failedImages[ev.id];
              const voteStat = votes[ev.id];

              return (
                <article key={ev.id} className="card">
                  <div style={{ position: 'relative' }}>
                    {showFallback ? (
                      <div className={`card-image-placeholder ${ev.categoria || 'default'}`}>
                        <span>{CATEGORY_EMOJI[ev.categoria] || '🎭'}</span>
                      </div>
                    ) : (
                      <img
                        src={imgUrl}
                        alt={ev.titulo}
                        className="card-image"
                        loading="lazy"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [ev.id]: true }))
                        }
                      />
                    )}
                    <div className="card-image-overlay">
                      <span className={`badge ${getCategoryBadgeClass(ev.categoria)}`}>
                        {ev.categoria}
                      </span>
                      <span
                        className={`badge ${
                          ev.estado === 'en_vivo' ? 'status-live' : 'status-scheduled'
                        }`}
                      >
                        {ev.estado === 'en_vivo' ? '● EN VIVO' : ev.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="card-body">
                    <h2 className="card-title">{ev.titulo}</h2>

                    <div className="meta">
                      <MapPin size={14} color="var(--accent)" />
                      <span>{ev.escenario?.nombre ?? 'Ubicación GPS callejera'}</span>
                    </div>
                    <div className="meta">
                      <Calendar size={14} color="var(--purple)" />
                      <span>
                        {ev.fecha} · {ev.horaInicio} ({ev.duracionMinutos} min)
                      </span>
                    </div>

                    {ev.aforoMaximo && (
                      <div style={{ marginTop: 4 }}>
                        <div
                          className="meta"
                          style={{ justifyContent: 'space-between', marginBottom: 5 }}
                        >
                          <span>
                            <Users size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            Aforo: <strong>{ev.aforoActual ?? 0}</strong>/{ev.aforoMaximo}
                          </span>
                          <span style={{ color: cap.color, fontWeight: 700 }}>{cap.label}</span>
                        </div>
                        <div className="progress-bg">
                          <div
                            className="progress-bar"
                            style={{ width: `${cap.pct}%`, background: cap.color }}
                          />
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 6,
                        paddingTop: 10,
                        borderTop: '1px solid var(--card-border)'
                      }}
                    >
                      {ev.estado === 'en_vivo' ? (
                        <button
                          className="chip"
                          style={{ padding: '5px 12px', fontSize: 12 }}
                          onClick={() => handleCastVote(ev.id, 5)}
                        >
                          👏 Aplaudir (5★){voteStat ? ` · ${voteStat.promedio}★` : ''}
                        </button>
                      ) : (
                        <span className="meta" style={{ fontSize: 12 }}>
                          Próximamente
                        </span>
                      )}
                      <button
                        className="chip"
                        style={{ padding: '5px 12px', fontSize: 12 }}
                        onClick={() => setTab('map')}
                      >
                        📍 Ver en Mapa
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {/* ===== TAB 2: MAPA DE LOJA ===== */}
      {tab === 'map' && (
        <div className="map-panel">
          <div className="map-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="section-icon green" style={{ width: 36, height: 36 }}>
                <Compass size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: 15 }}>
                  Mapa Cultural — Centro Histórico de Loja
                </strong>
                <span className="meta" style={{ fontSize: 12 }}>
                  GeoJSON en vivo (/api/v1/map/points) · Haz clic en los marcadores
                </span>
              </div>
            </div>
            <div className="map-legend">
              <span>
                <span className="legend-dot green" /> Evento oficial
              </span>
              <span>
                <span className="legend-dot orange" /> Flash Performance
              </span>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <LojaMap features={mapFeatures} />
          </div>
        </div>
      )}

      {/* ===== TAB 3: ESCENARIOS & AFORO ===== */}
      {tab === 'venues' && (
        <>
          <div className="section-header">
            <div className="section-icon blue">
              <Theater size={22} />
            </div>
            <div>
              <h2>Escenarios Oficiales & Semáforo de Aforo</h2>
              <p className="meta">Control de capacidad en tiempo real y sellado de Pasaporte</p>
            </div>
          </div>

          <div className="grid">
            {venues.map((v) => {
              const cap = getCapacityLevel(v.aforoActual ?? 0, v.capacidadMaxima);
              const stamped = stampedVenues.includes(v.id);
              return (
                <article key={v.id} className="card">
                  <div className="card-body">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={`venue-type-icon ${v.tipo || 'default'}`}>
                          {VENUE_EMOJI[v.tipo] || '📍'}
                        </div>
                        <div>
                          <span className="badge spec">{v.tipo}</span>
                        </div>
                      </div>
                      <span
                        className={`badge ${v.esCubierto ? 'cat-teatro' : 'cat-musica'}`}
                      >
                        {v.esCubierto ? '🏠 Cubierto' : '☀️ Al aire libre'}
                      </span>
                    </div>

                    <h2 className="card-title" style={{ marginTop: 4 }}>
                      {v.nombre}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
                      {v.descripcion}
                    </p>

                    <div style={{ marginTop: 6 }}>
                      <div
                        className="meta"
                        style={{ justifyContent: 'space-between', marginBottom: 6 }}
                      >
                        <span>Ocupación actual</span>
                        <span style={{ fontWeight: 700, color: cap.color }}>
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
                      className={`btn-stamp ${stamped ? 'stamped' : ''}`}
                      style={{ marginTop: 10, justifyContent: 'center' }}
                      onClick={() => handleStamp(v.id, v.nombre)}
                    >
                      {stamped ? (
                        <>
                          <CheckCircle2 size={17} /> Escenario Sellado (+50 pts)
                        </>
                      ) : (
                        <>
                          <Award size={17} /> Sellar en Pasaporte (100m)
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {/* ===== TAB 4: APLAUSÓMETRO & PASAPORTE ===== */}
      {tab === 'gamification' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Pasaporte Cultural */}
          <section className="passport-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                alignItems: 'center'
              }}
            >
              <div>
                <span className="badge spec">
                  <Award size={13} /> Spec 2 — Pasaporte Cultural Digital
                </span>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 26,
                    fontWeight: 900,
                    marginTop: 8
                  }}
                >
                  Tu Pasaporte FIAVL
                </h2>
                <p className="meta" style={{ marginTop: 4 }}>
                  Visita los escenarios del festival para coleccionar sellos y desbloquear insignias.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div className="stat-box">
                  <span className="stat-number" style={{ color: 'var(--purple)' }}>
                    {stampedVenues.length * 50}
                  </span>
                  <span className="stat-label">Puntos</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number" style={{ color: 'var(--accent)' }}>
                    {stampedVenues.length}/3
                  </span>
                  <span className="stat-label">Sellos</span>
                </div>
              </div>
            </div>

            <div className="passport-progress">
              {venues.map((v) => {
                const stamped = stampedVenues.includes(v.id);
                return (
                  <div
                    key={v.id}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                  >
                    <button
                      className={`stamp-circle ${stamped ? 'filled' : 'empty'}`}
                      onClick={() => handleStamp(v.id, v.nombre)}
                      title={stamped ? `${v.nombre} sellado` : `Sellar ${v.nombre}`}
                    >
                      {stamped ? '✓' : VENUE_EMOJI[v.tipo] || '📍'}
                    </button>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {v.nombre}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 20 }}>
              {stampedVenues.length >= 3 ? (
                <div className="badge-unlock earned">
                  🏅 ¡Badge Desbloqueado: Explorador Andino! (+150 pts totales)
                </div>
              ) : (
                <div className="badge-unlock pending">
                  🎯 Te faltan {3 - stampedVenues.length} sellos para desbloquear la insignia{' '}
                  <strong>Explorador Andino</strong> (haz clic en los círculos para sellar)
                </div>
              )}
            </div>
          </section>

          {/* Aplausómetro */}
          <section>
            <div className="section-header">
              <div className="section-icon pink">
                <Flame size={22} />
              </div>
              <div>
                <h2>Aplausómetro en Vivo</h2>
                <p className="meta">Califica en tiempo real los eventos que están sucediendo ahora</p>
              </div>
            </div>

            <div className="grid">
              {events
                .filter((e) => e.estado === 'en_vivo')
                .map((ev) => {
                  const st = votes[ev.id] ?? { totalVotos: 0, promedio: 0 };
                  return (
                    <article key={ev.id} className="card">
                      <div className="card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="badge status-live">● EN VIVO</span>
                          <span className={`badge ${getCategoryBadgeClass(ev.categoria)}`}>
                            {ev.categoria}
                          </span>
                        </div>
                        <h3 className="card-title">{ev.titulo}</h3>
                        <div className="meta">
                          <MapPin size={14} /> {ev.escenario?.nombre ?? 'Centro Histórico'}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginTop: 4,
                            padding: '10px 14px',
                            background: 'var(--yellow-light)',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          <Star size={20} fill="var(--yellow)" color="var(--yellow)" />
                          <span style={{ fontSize: 18, fontWeight: 800, color: '#92400e' }}>
                            {st.promedio}
                          </span>
                          <span style={{ fontSize: 13, color: '#92400e' }}>
                            ({st.totalVotos} aplausos)
                          </span>
                        </div>

                        <div style={{ marginTop: 4 }}>
                          <span className="meta" style={{ marginBottom: 6, fontWeight: 600 }}>
                            ¡Envía tu aplauso!
                          </span>
                          <div className="star-row">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                className="star-btn"
                                onClick={() => handleCastVote(ev.id, n)}
                                title={`Calificar con ${n} estrellas`}
                              >
                                {n}★
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        </div>
      )}

      {/* ===== TAB 5: ARQUITECTURA & SPECS ===== */}
      {tab === 'arch' && (
        <>
          <div className="section-header">
            <div className="section-icon purple">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2>Arquitectura Orientada a Eventos (SDD + EDA)</h2>
              <p className="meta">4 especificaciones validadas automáticamente en CI/CD</p>
            </div>
          </div>

          <div className="grid">
            <div className="spec-card">
              <div className="spec-card-stripe s1" />
              <div className="spec-card-body">
                <span className="badge cat-flash">Spec 1 — OpenAPI 3.1</span>
                <h2 className="card-title">Catalog Service</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Gestión de eventos, escenarios, agenda horaria y generación de GeoJSON para el mapa
                  interactivo de Loja.
                </p>
                <div className="meta">
                  <Activity size={14} color="var(--green)" /> Spectral Lint: 0 errores · 10 endpoints
                </div>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-card-stripe s2" />
              <div className="spec-card-body">
                <span className="badge spec">Spec 2 — OpenAPI 3.1</span>
                <h2 className="card-title">Gamification Service</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Pasaporte cultural digital con geocerca de 100m, sellos coleccionables, badges y
                  Aplausómetro en vivo (200m).
                </p>
                <div className="meta">
                  <Award size={14} color="var(--purple)" /> Spectral Lint: 0 errores · 8 endpoints
                </div>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-card-stripe s3" />
              <div className="spec-card-body">
                <span className="badge cat-musica">Spec 3 — AsyncAPI 3.0</span>
                <h2 className="card-title">Live Telemetry Service</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Streaming WebSocket bidireccional sobre Redis Pub/Sub para alertas de clima,
                  aforo en vivo y flash-performances.
                </p>
                <div className="meta">
                  <Radio size={14} color="var(--teal)" /> AsyncAPI Validate: 0 errores · 6 canales
                </div>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-card-stripe s4" />
              <div className="spec-card-body">
                <span className="badge cat-teatro">Spec 4 — Gherkin BDD</span>
                <h2 className="card-title">5 Features · 42 Escenarios</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Criterios de aceptación ejecutables para control de aforo, alertas climáticas,
                  flash-performances, pasaporte y votación.
                </p>
                <div className="meta">
                  <Music size={14} color="var(--blue)" /> @cucumber/gherkin: 100% válidos
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <footer className="footer">
        Pulso Loja · Festival Internacional de Artes Vivas de Loja (FIAVL) · Proyecto SDD &amp; EDA — UTPL
      </footer>
    </div>
  );
}
