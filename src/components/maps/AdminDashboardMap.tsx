'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { LeafletMap, MapMarker, MapRoute } from './LeafletMap';
import { FaTrain, FaExclamationTriangle, FaWrench, FaMapMarkerAlt } from 'react-icons/fa';
import styles from './LeafletMap.module.scss';

interface AdminDashboardMapProps {
  height?: string;
  showControls?: boolean;
  onStationClick?: (station: any) => void;
  onTrainClick?: (train: any) => void;
  onAlertClick?: (alert: any) => void;
}

// Mock data for admin dashboard
const stations = [
  { id: '1', name: 'Aluva', position: [10.1075, 76.3500] as [number, number], type: 'terminal' },
  { id: '2', name: 'Edapally', position: [10.0075, 76.4300] as [number, number], type: 'station' },
  { id: '3', name: 'Kaloor', position: [9.9575, 76.4700] as [number, number], type: 'station' },
  { id: '4', name: 'Thykoodam', position: [9.8700, 76.5400] as [number, number], type: 'terminal' }
];

const trains = [
  { id: 'T1', name: 'KMRL-001', position: [10.0500, 76.4000] as [number, number], status: 'revenue' },
  { id: 'T2', name: 'KMRL-002', position: [9.9500, 76.4500] as [number, number], status: 'standby' },
  { id: 'T3', name: 'KMRL-003', position: [9.9000, 76.5000] as [number, number], status: 'maintenance' }
];

const alerts = [
  { id: 'A1', message: 'Delay at Edapally', position: [10.0075, 76.4300] as [number, number], severity: 'high' },
  { id: 'A2', message: 'Maintenance at Kaloor', position: [9.9575, 76.4700] as [number, number], severity: 'medium' }
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

export function AdminDashboardMap({ 
  height = '500px', 
  showControls = true,
  onStationClick,
  onTrainClick,
  onAlertClick 
}: AdminDashboardMapProps) {
  const [selectedLayer, setSelectedLayer] = useState('all');

  // Create markers based on selected layer
  const getMarkers = (): MapMarker[] => {
    const markers: MapMarker[] = [];

    if (selectedLayer === 'all' || selectedLayer === 'stations') {
      stations.forEach(station => {
        markers.push({
          id: station.id,
          position: station.position,
          title: station.name,
          description: station.type === 'terminal' ? 'Terminal Station' : 'Metro Station',
          type: station.type as any,
          color: station.type === 'terminal' ? '#10b981' : '#2563eb',
          size: station.type === 'terminal' ? 24 : 20
        });
      });
    }

    if (selectedLayer === 'all' || selectedLayer === 'trains') {
      trains.forEach(train => {
        const statusColors = {
          revenue: '#10b981',
          standby: '#f59e0b',
          maintenance: '#dc2626'
        };
        
        markers.push({
          id: train.id,
          position: train.position,
          title: train.name,
          description: `Status: ${train.status}`,
          type: 'train',
          color: statusColors[train.status as keyof typeof statusColors],
          size: 18
        });
      });
    }

    if (selectedLayer === 'all' || selectedLayer === 'alerts') {
      alerts.forEach(alert => {
        const severityColors = {
          high: '#dc2626',
          medium: '#f59e0b',
          low: '#3b82f6'
        };
        
        markers.push({
          id: alert.id,
          position: alert.position,
          title: 'Alert',
          description: alert.message,
          type: 'alert',
          color: severityColors[alert.severity as keyof typeof severityColors],
          size: 16
        });
      });
    }

    return markers;
  };

  const handleMarkerClick = (marker: MapMarker) => {
    if (marker.type === 'station' || marker.type === 'terminal') {
      onStationClick?.(marker);
    } else if (marker.type === 'train') {
      onTrainClick?.(marker);
    } else if (marker.type === 'alert') {
      onAlertClick?.(marker);
    }
  };

  return (
    <Card variant="elevated" className={styles.mapCard}>
      <div className={styles.mapHeader}>
        <div className={styles.mapTitle}>
          <FaMapMarkerAlt className={styles.mapIcon} />
          <span>Admin Dashboard Map</span>
        </div>
        
        <div className={styles.mapControls}>
          <select
            value={selectedLayer}
            onChange={(e) => setSelectedLayer(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text)'
            }}
          >
            <option value="all">All Layers</option>
            <option value="stations">Stations Only</option>
            <option value="trains">Trains Only</option>
            <option value="alerts">Alerts Only</option>
          </select>
        </div>
      </div>

      <div className={styles.mapContainer}>
        <LeafletMap
          center={[9.98, 76.45]}
          zoom={12}
          height={height}
          markers={getMarkers()}
          routes={[metroRoute]}
          showControls={showControls}
          onMarkerClick={handleMarkerClick}
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
        <div className={styles.legendItem}>
          <div className={`${styles.legendMarker} ${styles.train}`}></div>
          <span>Train</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendMarker} ${styles.alert}`}></div>
          <span>Alert</span>
        </div>
      </div>
    </Card>
  );
}
