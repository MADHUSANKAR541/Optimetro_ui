'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { 
  ssr: false,
  loading: () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>Loading map...</div>
});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), { ssr: false });

export interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  description?: string;
  type?: 'station' | 'train' | 'alert' | 'maintenance' | 'terminal';
  color?: string;
  size?: number;
  popup?: React.ReactNode;
}

export interface MapRoute {
  id: string;
  positions: [number, number][];
  color?: string;
  weight?: number;
  dashArray?: string;
  opacity?: number;
}

export interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  height?: string;
  width?: string;
  markers?: MapMarker[];
  routes?: MapRoute[];
  showControls?: boolean;
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

// Custom marker icons
const createCustomIcon = (type: string, color: string = '#2563eb', size: number = 20) => {
  const L = require('leaflet');
  
  const iconColors = {
    station: '#2563eb',
    train: '#10b981',
    alert: '#dc2626',
    maintenance: '#f59e0b',
    terminal: '#10b981'
  };
  
  const iconColor = iconColors[type as keyof typeof iconColors] || color;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${iconColor};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        font-size: ${size * 0.4}px;
        color: white;
        font-weight: bold;
      ">
        ${type === 'terminal' ? 'T' : type === 'train' ? '🚇' : type === 'alert' ? '⚠' : '📍'}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

export function LeafletMap({
  center,
  zoom = 12,
  height = '400px',
  width = '100%',
  markers = [],
  routes = [],
  showControls = true,
  className = '',
  onMarkerClick,
  onMapClick
}: LeafletMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Debug routes
  useEffect(() => {
    console.log('🗺️ LeafletMap: Received routes:', routes);
  }, [routes]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div style={{ 
        height, 
        width, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f3f4f6',
        borderRadius: '8px',
        color: '#6b7280'
      }}>
        <div>Loading map...</div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div style={{ 
        height, 
        width, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#fef2f2',
        borderRadius: '8px',
        color: '#dc2626',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div>Map loading error</div>
        <button 
          onClick={() => setMapError(false)}
          style={{
            padding: '8px 16px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div 
      style={{ height, width }}
      onError={() => setMapError(true)}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className={`leaflet-map ${className}`}
        zoomControl={showControls}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Routes */}
        {routes.map((route) => {
          console.log('🗺️ LeafletMap: Rendering route:', route);
          return (
            <Polyline
              key={route.id}
              positions={route.positions}
              pathOptions={{
                color: route.color || '#2563eb',
                weight: route.weight || 4,
                opacity: route.opacity || 0.8,
                dashArray: route.dashArray
              }}
            />
          );
        })}
        
        {/* Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={createCustomIcon(
              marker.type || 'station',
              marker.color,
              marker.size || 20
            )}
            eventHandlers={{
              click: () => onMarkerClick?.(marker)
            }}
          >
            {marker.popup && <Popup>{marker.popup}</Popup>}
            {!marker.popup && (marker.title || marker.description) && (
              <Popup>
                <div style={{ padding: '8px', fontFamily: 'Arial, sans-serif' }}>
                  {marker.title && (
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      color: '#1f2937', 
                      fontSize: '16px', 
                      fontWeight: '600' 
                    }}>
                      {marker.title}
                    </h3>
                  )}
                  {marker.description && (
                    <p style={{ 
                      margin: '0', 
                      color: '#6b7280', 
                      fontSize: '14px' 
                    }}>
                      {marker.description}
                    </p>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
