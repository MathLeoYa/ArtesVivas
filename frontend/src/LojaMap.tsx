import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    tipo: string;
    titulo: string;
    estado: string;
    nivelAforo: string;
  };
}

interface LojaMapProps {
  features: MapFeature[];
}

export default function LojaMap({ features }: LojaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([-3.9985, -79.1972], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();

    features.forEach((f) => {
      const [lng, lat] = f.geometry.coordinates;
      const isFlash = f.properties.tipo === 'flash';
      const circle = L.circleMarker([lat, lng], {
        radius: isFlash ? 11 : 9,
        color: isFlash ? '#f59e0b' : '#10b981',
        fillColor: isFlash ? '#f59e0b' : '#10b981',
        fillOpacity: 0.75,
        weight: 2
      });
      circle.bindPopup(
        `<div style="color:#0b0f19;font-family:sans-serif">
          <strong>${f.properties.titulo}</strong><br/>
          Tipo: ${f.properties.tipo.toUpperCase()}<br/>
          Estado: ${f.properties.estado}
        </div>`
      );
      circle.addTo(layer);
    });
  }, [features]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 430,
        borderRadius: 14,
        border: '1px solid var(--card-border)',
        overflow: 'hidden'
      }}
    />
  );
}
