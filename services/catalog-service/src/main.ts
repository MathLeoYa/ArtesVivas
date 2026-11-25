import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const venues = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    nombre: 'Plaza San Sebastián',
    tipo: 'plaza',
    coordenadas: { lat: -3.9985, lng: -79.1972 },
    capacidadMaxima: 500,
    esCubierto: false,
    descripcion: 'Plaza principal del centro histórico de Loja',
    aforoActual: 234,
    nivelAforo: 'verde'
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    nombre: 'Teatro Benjamín Carrión',
    tipo: 'teatro',
    coordenadas: { lat: -3.997, lng: -79.198 },
    capacidadMaxima: 300,
    esCubierto: true,
    descripcion: 'Teatro principal del festival con aforo cubierto',
    aforoActual: 225,
    nivelAforo: 'amarillo'
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    nombre: 'Calle Lourdes',
    tipo: 'calle',
    coordenadas: { lat: -3.9995, lng: -79.196 },
    capacidadMaxima: 1000,
    esCubierto: false,
    descripcion: 'Calle peatonal histórica, escenario de flash-performances',
    aforoActual: 420,
    nivelAforo: 'verde'
  }
];

const events = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    titulo: 'Danza de los Saraguros',
    categoria: 'danza',
    estado: 'en_vivo',
    fecha: '2026-10-15',
    horaInicio: '19:00',
    duracionMinutos: 60,
    escenario: { id: venues[0].id, nombre: venues[0].nombre },
    coordenadas: venues[0].coordenadas,
    aforoActual: 234,
    aforoMaximo: 500,
    esFlash: false
  },
  {
    id: '660e9500-e29b-41d4-a716-556655440001',
    titulo: 'Máscaras y Ritos — Teatro Experimental',
    categoria: 'teatro',
    estado: 'programado',
    fecha: '2026-10-15',
    horaInicio: '20:00',
    duracionMinutos: 90,
    escenario: { id: venues[1].id, nombre: venues[1].nombre },
    coordenadas: venues[1].coordenadas,
    aforoActual: 225,
    aforoMaximo: 300,
    esFlash: false
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440003',
    titulo: 'Máscaras Rituales — Improvisación',
    categoria: 'flash',
    estado: 'en_vivo',
    fecha: '2026-10-15',
    horaInicio: '18:15',
    duracionMinutos: 20,
    escenario: { id: venues[2].id, nombre: venues[2].nombre },
    coordenadas: venues[2].coordenadas,
    aforoActual: 145,
    aforoMaximo: 150,
    esFlash: true
  }
];

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'catalog-service', timestamp: new Date().toISOString() });
});

app.get('/api/v1/events', (req, res) => {
  const { categoria, estado } = req.query;
  let result = events;
  if (typeof categoria === 'string') {
    result = result.filter((e) => e.categoria === categoria);
  }
  if (typeof estado === 'string') {
    result = result.filter((e) => e.estado === estado);
  }
  res.json({
    data: result,
    pagination: { page: 1, limit: 20, total: result.length }
  });
});

app.get('/api/v1/events/:id', (req, res) => {
  const found = events.find((e) => e.id === req.params.id);
  if (!found) {
    return res.status(404).json({ code: 'EVENT_NOT_FOUND', message: 'Evento no encontrado' });
  }
  return res.json(found);
});

app.get('/api/v1/venues', (_req, res) => {
  res.json(venues);
});

app.get('/api/v1/venues/:id', (req, res) => {
  const found = venues.find((v) => v.id === req.params.id);
  if (!found) {
    return res.status(404).json({ code: 'VENUE_NOT_FOUND', message: 'Escenario no encontrado' });
  }
  return res.json({ ...found, eventosHoy: events.filter((e) => e.escenario?.id === found.id) });
});

app.get('/api/v1/schedule', (_req, res) => {
  res.json([
    {
      fecha: '2026-10-15',
      slots: events.map((evento) => ({
        horaInicio: evento.horaInicio,
        horaFin: '21:00',
        evento
      }))
    }
  ]);
});

app.get('/api/v1/map/points', (_req, res) => {
  res.type('application/geo+json').json({
    type: 'FeatureCollection',
    features: events.map((ev) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [ev.coordenadas.lng, ev.coordenadas.lat]
      },
      properties: {
        id: ev.id,
        tipo: ev.esFlash ? 'flash' : 'evento',
        titulo: ev.titulo,
        estado: ev.estado,
        nivelAforo: 'verde'
      }
    }))
  });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`catalog-service running on port ${port}`);
});
