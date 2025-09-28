'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { LeafletMap, MapMarker, MapRoute } from './LeafletMap';
import { FaTrain, FaMapMarkerAlt, FaRoute, FaClock } from 'react-icons/fa';
import styles from './LeafletMap.module.scss';

interface CommuterDashboardMapProps {
  height?: string;
  showControls?: boolean;
  onStationClick?: (station: any) => void;
  onRouteClick?: (route: any) => void;
}

// Mock data for commuter dashboard
const stations = [
  { 
    id: '1', 
    name: 'Aluva', 
    position: [10.1075, 76.3500] as [number, number], 
    type: 'terminal',
    nextTrain: '2 mins',
    platform: 'Platform 1'
  },
  { 
    id: '2', 
    name: 'Edapally', 
    position: [10.0075, 76.4300] as [number, number], 
    type: 'station',
    nextTrain: '5 mins',
    platform: 'Platform 2'
  },
  { 
    id: '3', 
    name: 'Kaloor', 
    position: [9.9575, 76.4700] as [number, number], 
    type: 'station',
    nextTrain: '3 mins',
    platform: 'Platform 1'
  },
  { 
    id: '4', 
    name: 'Thykoodam', 
    position: [9.8700, 76.5400] as [number, number], 
    type: 'terminal',
    nextTrain: '1 min',
    platform: 'Platform 2'
  }
];

const popularRoutes = [
  {
    id: 'route-1',
    name: 'Aluva to Thykoodam',
    from: 'Aluva',
    to: 'Thykoodam',
    duration: '45 mins',
    fare: '₹25',
    positions: [
      [10.1075, 76.3500],
      [10.0075, 76.4300],
      [9.9575, 76.4700],
      [9.8700, 76.5400]
    ]
  },
  {
    id: 'route-2',
    name: 'Edapally to Kaloor',
    from: 'Edapally',
    to: 'Kaloor',
    duration: '15 mins',
    fare: '₹12',
    positions: [
      [10.0075, 76.4300],
      [9.9575, 76.4700]
    ]
  }
];

const metroRoute: MapRoute = {
  id: 'metro-line-1',
  positions: [
    [10.1075, 76.3500],
    [10.0950, 76.3600],
    [10.0825, 76.3700],
    [10.0700, 76.3800],
    [10.0575, 76.3900],
    [10.0450, 76.4000],
    [10.0325, 76.4100],
    [10.0200, 76.4200],
    [10.0075, 76.4300],
    [9.9950, 76.4400],
    [9.9825, 76.4500],
    [9.9700, 76.4600],
    [9.9575, 76.4700],
    [9.9450, 76.4800],
    [9.9325, 76.4900],
    [9.9200, 76.5000],
    [9.9075, 76.5100],
    [9.8950, 76.5200],
    [9.8825, 76.5300],
    [9.8700, 76.5400]
  ],
  color: '#2563eb',
  weight: 6,
  opacity: 0.8
};

export function CommuterDashboardMap({ 
  height = '500px', 
  showControls = true,
  onStationClick,
  onRouteClick 
}: CommuterDashboardMapProps) {
  const [selectedRoute, setSelectedRoute] = useState<string>('');

  // Create station markers
  const getStationMarkers = (): MapMarker[] => {
    return stations.map(station => ({
      id: station.id,
      position: station.position,
      title: station.name,
      description: `Next train: ${station.nextTrain} | Platform: ${station.platform}`,
      type: station.type as any,
      color: station.type === 'terminal' ? '#10b981' : '#2563eb',
      size: station.type === 'terminal' ? 24 : 20,
      popup: (
        <div style={{ padding: '8px', fontFamily: 'Arial, sans-serif' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
            {station.name}
          </h3>
          <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
            Next train: <strong>{station.nextTrain}</strong>
          </p>
          <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
            Platform: <strong>{station.platform}</strong>
          </p>
          {station.type === 'terminal' && (
            <p style={{ margin: '0', color: '#10b981', fontSize: '12px', fontWeight: '600' }}>
              TERMINAL STATION
            </p>
          )}
        </div>
      )
    }));
  };

  // Get selected route
  const getSelectedRoute = (): MapRoute | undefined => {
    if (!selectedRoute) return undefined;
    
    const route = popularRoutes.find(r => r.id === selectedRoute);
    if (!route) return undefined;

    return {
      id: route.id,
      positions: route.positions as [number, number][],
      color: '#10b981',
      weight: 4,
      dashArray: '10, 5',
      opacity: 0.9
    };
  };

  const handleStationClick = (marker: MapMarker) => {
    onStationClick?.(marker);
  };

  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
    const route = popularRoutes.find(r => r.id === routeId);
    if (route) {
      onRouteClick?.(route);
    }
  };

  return (
    <Card variant="elevated" className={styles.mapCard}>
      <div className={styles.mapHeader}>
        <div className={styles.mapTitle}>
          <FaRoute className={styles.mapIcon} />
          <span>Plan Your Journey</span>
        </div>
        
        <div className={styles.mapControls}>
          <select
            value={selectedRoute}
            onChange={(e) => handleRouteSelect(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text)'
            }}
          >
            <option value="">Select a route</option>
            {popularRoutes.map(route => (
              <option key={route.id} value={route.id}>
                {route.name} ({route.duration}, {route.fare})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.mapContainer}>
        <LeafletMap
          center={[9.98, 76.45]}
          zoom={12}
          height={height}
          markers={getStationMarkers()}
          routes={[metroRoute, ...(getSelectedRoute() ? [getSelectedRoute()!] : [])]}
          showControls={showControls}
          onMarkerClick={handleStationClick}
        />
      </div>

      <div className={styles.mapLegend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendMarker} ${styles.terminal}`}></div>
          <span>Terminal Station</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendMarker}`}></div>
          <span>Metro Station</span>
        </div>
        {selectedRoute && (
          <div className={styles.legendItem}>
            <div style={{ 
              width: '12px', 
              height: '3px', 
              background: '#10b981',
              borderRadius: '2px'
            }}></div>
            <span>Selected Route</span>
          </div>
        )}
      </div>
    </Card>
  );
}
