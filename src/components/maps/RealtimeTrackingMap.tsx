'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { LeafletMap, MapMarker, MapRoute } from './LeafletMap';
import { FaTrain, FaMapMarkerAlt, FaClock, FaWifi } from 'react-icons/fa';
import styles from './LeafletMap.module.scss';

interface RealtimeTrackingMapProps {
  height?: string;
  showControls?: boolean;
  onTrainClick?: (train: any) => void;
}

// Mock real-time train data
const trains = [
  {
    id: 'T1',
    name: 'KMRL-001',
    position: [10.1075, 76.3500] as [number, number],
    status: 'moving',
    speed: '45 km/h',
    direction: 'south',
    nextStation: 'Pulinchodu',
    eta: '2 mins',
    passengers: 85,
    capacity: 100
  },
  {
    id: 'T2',
    name: 'KMRL-002',
    position: [10.0075, 76.4300] as [number, number],
    status: 'stopped',
    speed: '0 km/h',
    direction: 'north',
    nextStation: 'Companypady',
    eta: '0 mins',
    passengers: 92,
    capacity: 100
  },
  {
    id: 'T3',
    name: 'KMRL-003',
    position: [9.9575, 76.4700] as [number, number],
    status: 'moving',
    speed: '38 km/h',
    direction: 'south',
    nextStation: 'Town Hall',
    eta: '4 mins',
    passengers: 67,
    capacity: 100
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

export function RealtimeTrackingMap({ 
  height = '500px', 
  showControls = true,
  onTrainClick 
}: RealtimeTrackingMapProps) {
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // In a real app, this would fetch new train positions from an API
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  // Create train markers
  const getTrainMarkers = (): MapMarker[] => {
    return trains.map(train => {
      const statusColors = {
        moving: '#10b981',
        stopped: '#f59e0b',
        maintenance: '#dc2626'
      };

      const occupancyColor = train.passengers > 90 ? '#dc2626' : 
                            train.passengers > 70 ? '#f59e0b' : '#10b981';

      return {
        id: train.id,
        position: train.position,
        title: train.name,
        description: `${train.status} • ${train.speed} • ${train.passengers}/${train.capacity} passengers`,
        type: 'train',
        color: statusColors[train.status as keyof typeof statusColors],
        size: 20,
        popup: (
          <div style={{ padding: '8px', fontFamily: 'Arial, sans-serif', minWidth: '200px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
              {train.name}
            </h3>
            <div style={{ marginBottom: '8px' }}>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
                <strong>Status:</strong> {train.status.charAt(0).toUpperCase() + train.status.slice(1)}
              </p>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
                <strong>Speed:</strong> {train.speed}
              </p>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
                <strong>Direction:</strong> {train.direction.charAt(0).toUpperCase() + train.direction.slice(1)}
              </p>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
                <strong>Next Station:</strong> {train.nextStation}
              </p>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
                <strong>ETA:</strong> {train.eta}
              </p>
            </div>
            <div style={{ 
              padding: '6px 8px', 
              background: occupancyColor === '#dc2626' ? '#fef2f2' : 
                         occupancyColor === '#f59e0b' ? '#fffbeb' : '#f0fdf4',
              borderRadius: '4px',
              border: `1px solid ${occupancyColor}`
            }}>
              <p style={{ margin: '0', color: occupancyColor, fontSize: '12px', fontWeight: '600' }}>
                Occupancy: {train.passengers}/{train.capacity} ({Math.round((train.passengers/train.capacity)*100)}%)
              </p>
            </div>
          </div>
        )
      };
    });
  };

  const handleTrainClick = (marker: MapMarker) => {
    onTrainClick?.(marker);
  };

  const toggleLiveTracking = () => {
    setIsLive(!isLive);
  };

  return (
    <Card variant="elevated" className={styles.mapCard}>
      <div className={styles.mapHeader}>
        <div className={styles.mapTitle}>
          <FaTrain className={styles.mapIcon} />
          <span>Real-time Train Tracking</span>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginLeft: 'auto',
            fontSize: '12px',
            color: isLive ? '#10b981' : '#6b7280'
          }}>
            <FaWifi style={{ color: isLive ? '#10b981' : '#6b7280' }} />
            <span>{isLive ? 'LIVE' : 'PAUSED'}</span>
          </div>
        </div>
        
        <div className={styles.mapControls}>
          <button
            onClick={toggleLiveTracking}
            style={{
              padding: '8px 16px',
              background: isLive ? '#dc2626' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <FaClock />
            <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <div className={styles.mapContainer}>
        <LeafletMap
          center={[9.98, 76.45]}
          zoom={12}
          height={height}
          markers={getTrainMarkers()}
          routes={[metroRoute]}
          showControls={showControls}
          onMarkerClick={handleTrainClick}
        />
      </div>

      <div className={styles.mapLegend}>
        <div className={styles.legendItem}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%',
            background: '#10b981',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}></div>
          <span>Moving Train</span>
        </div>
        <div className={styles.legendItem}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%',
            background: '#f59e0b',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}></div>
          <span>Stopped Train</span>
        </div>
        <div className={styles.legendItem}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%',
            background: '#dc2626',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}></div>
          <span>Maintenance</span>
        </div>
      </div>
    </Card>
  );
}
