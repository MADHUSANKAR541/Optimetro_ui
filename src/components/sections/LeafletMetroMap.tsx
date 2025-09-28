'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { 
  FaMapMarkerAlt, 
  FaTrain, 
  FaClock,
  FaUsers,
  FaRoute
} from 'react-icons/fa';
import styles from './MetroMap.module.scss';

// React Leaflet imports
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className={styles.mapLoading}><div className={styles.loadingSpinner}></div><p>Loading map...</p></div>
});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });

// Kochi Metro stations with actual coordinates
const stations = [
  { 
    name: 'Aluva', 
    lat: 10.1075, 
    lng: 76.3500, 
    isTerminal: true,
    description: 'Terminal Station - North End'
  },
  { 
    name: 'Pulinchodu', 
    lat: 10.0950, 
    lng: 76.3600,
    description: 'Intermediate Station'
  },
  { 
    name: 'Companypady', 
    lat: 10.0825, 
    lng: 76.3700,
    description: 'Intermediate Station'
  },
  { 
    name: 'Ambattukavu', 
    lat: 10.0700, 
    lng: 76.3800,
    description: 'Intermediate Station'
  },
  { 
    name: 'Muttom', 
    lat: 10.0575, 
    lng: 76.3900,
    description: 'Intermediate Station'
  },
  { 
    name: 'Kalamassery', 
    lat: 10.0450, 
    lng: 76.4000,
    description: 'Intermediate Station'
  },
  { 
    name: 'Cochin University', 
    lat: 10.0325, 
    lng: 76.4100,
    description: 'University Station'
  },
  { 
    name: 'Pathadipalam', 
    lat: 10.0200, 
    lng: 76.4200,
    description: 'Intermediate Station'
  },
  { 
    name: 'Edapally', 
    lat: 10.0075, 
    lng: 76.4300,
    description: 'Major Junction Station'
  },
  { 
    name: 'Changampuzha Park', 
    lat: 9.9950, 
    lng: 76.4400,
    description: 'Park Station'
  },
  { 
    name: 'Palarivattom', 
    lat: 9.9825, 
    lng: 76.4500,
    description: 'Intermediate Station'
  },
  { 
    name: 'JLN Stadium', 
    lat: 9.9700, 
    lng: 76.4600,
    description: 'Stadium Station'
  },
  { 
    name: 'Kaloor', 
    lat: 9.9575, 
    lng: 76.4700,
    description: 'Major Commercial Station'
  },
  { 
    name: 'Town Hall', 
    lat: 9.9450, 
    lng: 76.4800,
    description: 'City Center Station'
  },
  { 
    name: 'Maharaja\'s College', 
    lat: 9.9325, 
    lng: 76.4900,
    description: 'College Station'
  },
  { 
    name: 'Ernakulam South', 
    lat: 9.9200, 
    lng: 76.5000,
    description: 'Major Junction Station'
  },
  { 
    name: 'Kadavanthra', 
    lat: 9.9075, 
    lng: 76.5100,
    description: 'Intermediate Station'
  },
  { 
    name: 'Elamkulam', 
    lat: 9.8950, 
    lng: 76.5200,
    description: 'Intermediate Station'
  },
  { 
    name: 'Vytilla', 
    lat: 9.8825, 
    lng: 76.5300,
    description: 'Major Hub Station'
  },
  { 
    name: 'Thykoodam', 
    lat: 9.8700, 
    lng: 76.5400, 
    isTerminal: true,
    description: 'Terminal Station - South End'
  }
];

const routeInfo = [
  { icon: <FaRoute />, label: 'Route Length', value: '25.2 km' },
  { icon: <FaMapMarkerAlt />, label: 'Stations', value: '20' },
  { icon: <FaClock />, label: 'Travel Time', value: '45 mins' },
  { icon: <FaUsers />, label: 'Daily Ridership', value: '50,000+' }
];

// Custom marker icons
const createCustomIcon = (isTerminal: boolean) => {
  const L = require('leaflet');
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${isTerminal ? '24px' : '20px'};
        height: ${isTerminal ? '24px' : '20px'};
        background: ${isTerminal ? '#10b981' : '#2563eb'};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          width: ${isTerminal ? '8px' : '6px'};
          height: ${isTerminal ? '8px' : '6px'};
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [isTerminal ? 24 : 20, isTerminal ? 24 : 20],
    iconAnchor: [isTerminal ? 12 : 10, isTerminal ? 12 : 10],
    popupAnchor: [0, isTerminal ? -12 : -10]
  });
};

export function LeafletMetroMap() {
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    console.log('🗺️ LeafletMetroMap: Component mounted, setting client to true');
    setIsClient(true);
    
    // Force map to show after 3 seconds even if there are issues
    const timeout = setTimeout(() => {
      console.log('🗺️ LeafletMetroMap: Forcing map to show after timeout');
      setIsClient(true);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Create metro route path
  const routePath = stations.map(station => [station.lat, station.lng] as [number, number]);

  if (!isClient) {
    return (
      <section id="metro-map" className={styles.metroMap}>
        <div className={styles.container}>
          <div className={styles.mapLoading}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading map...</p>
            <small>Initializing Leaflet map...</small>
          </div>
        </div>
      </section>
    );
  }

  if (mapError) {
    return (
      <section id="metro-map" className={styles.metroMap}>
        <div className={styles.container}>
          <div className={styles.errorMessage}>
            <h2>Map Loading Error</h2>
            <p>Unable to load the interactive map. Please refresh the page.</p>
            <button onClick={() => setMapError(false)} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="metro-map" className={styles.metroMap}>
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={styles.header}
        >
          <h2 className={styles.title}>Kochi Metro Route Map</h2>
          <p className={styles.subtitle}>
            Explore our metro network on an interactive map. Click on stations to see details 
            and plan your journey across Kochi.
          </p>
        </motion.div>

        {/* Route Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className={styles.routeInfo}
        >
          <div className={styles.routeStats}>
            {routeInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={styles.statCard}
              >
                <div className={styles.statIcon}>{info.icon}</div>
                <div className={styles.statValue}>{info.value}</div>
                <div className={styles.statLabel}>{info.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Leaflet Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className={styles.mapContainer}
        >
          <Card variant="elevated" className={styles.mapCard}>
            <div className={styles.mapTitle}>
              <FaTrain className={styles.mapIcon} />
              <span>Kochi Metro Line 1 - Interactive Map</span>
            </div>
            
            <div className={styles.mapWrapper}>
              <div 
                style={{ height: '100%', width: '100%' }}
                onError={() => {
                  console.error('❌ Map container error');
                  setMapError(true);
                }}
              >
                <MapContainer
                  center={[9.98, 76.45]} // Center of Kochi
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                  className={styles.leafletMap}
                >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Metro Route Line */}
                <Polyline
                  positions={routePath}
                  pathOptions={{
                    color: '#2563eb',
                    weight: 6,
                    opacity: 0.8,
                    dashArray: '10, 5'
                  }}
                />
                
                {/* Station Markers */}
                {stations.map((station, index) => (
                  <Marker
                    key={index}
                    position={[station.lat, station.lng] as [number, number]}
                    icon={createCustomIcon(station.isTerminal || false)}
                  >
                    <Popup>
                      <div style={{ padding: '8px', fontFamily: 'Arial, sans-serif' }}>
                        <h3 style={{ 
                          margin: '0 0 8px 0', 
                          color: '#1f2937', 
                          fontSize: '16px', 
                          fontWeight: '600' 
                        }}>
                          {station.name}
                        </h3>
                        <p style={{ 
                          margin: '0 0 4px 0', 
                          color: '#6b7280', 
                          fontSize: '14px' 
                        }}>
                          {station.description}
                        </p>
                        {station.isTerminal && (
                          <p style={{ 
                            margin: '0', 
                            color: '#10b981', 
                            fontSize: '12px', 
                            fontWeight: '600' 
                          }}>
                            TERMINAL STATION
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
                </MapContainer>
              </div>
            </div>
            
            <div className={styles.mapLegend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendMarker} ${styles.terminal}`}></div>
                <span>Terminal Station</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendMarker} ${styles.intermediate}`}></div>
                <span>Intermediate Station</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className={styles.quickActions}
        >
          <h3 className={styles.actionsTitle}>Plan Your Journey</h3>
          <div className={styles.actionButtons}>
            <a href="/book-tickets" className={styles.actionButton}>
              <FaTrain className={styles.actionIcon} />
              <span>Book Tickets</span>
            </a>
            <a href="/commuter/dashboard" className={styles.actionButton}>
              <FaRoute className={styles.actionIcon} />
              <span>Plan Route</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
