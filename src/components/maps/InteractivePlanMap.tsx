'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { LeafletMap, MapMarker, MapRoute } from './LeafletMap';
import { FaTrain, FaMapMarkerAlt, FaRoute, FaClock, FaRupeeSign } from 'react-icons/fa';
import styles from './LeafletMap.module.scss';

interface InteractivePlanMapProps {
  fromStation?: string;
  toStation?: string;
  height?: string;
  showControls?: boolean;
  onStationClick?: (station: any) => void;
  onRouteClick?: (route: any) => void;
}

// Kochi Metro stations with coordinates
const metroStations = [
  { name: 'Aluva', lat: 10.1075, lng: 76.3500, isTerminal: true },
  { name: 'Pulinchodu', lat: 10.0950, lng: 76.3600, isTerminal: false },
  { name: 'Companypady', lat: 10.0825, lng: 76.3700, isTerminal: false },
  { name: 'Ambattukavu', lat: 10.0700, lng: 76.3800, isTerminal: false },
  { name: 'Muttom', lat: 10.0575, lng: 76.3900, isTerminal: false },
  { name: 'Kalamassery', lat: 10.0450, lng: 76.4000, isTerminal: false },
  { name: 'Cochin University', lat: 10.0325, lng: 76.4100, isTerminal: false },
  { name: 'Pathadipalam', lat: 10.0200, lng: 76.4200, isTerminal: false },
  { name: 'Edapally', lat: 10.0075, lng: 76.4300, isTerminal: false },
  { name: 'Changampuzha Park', lat: 9.9950, lng: 76.4400, isTerminal: false },
  { name: 'Palarivattom', lat: 9.9825, lng: 76.4500, isTerminal: false },
  { name: 'JLN Stadium', lat: 9.9700, lng: 76.4600, isTerminal: false },
  { name: 'Kaloor', lat: 9.9575, lng: 76.4700, isTerminal: false },
  { name: 'Town Hall', lat: 9.9450, lng: 76.4800, isTerminal: false },
  { name: 'Maharaja\'s College', lat: 9.9325, lng: 76.4900, isTerminal: false },
  { name: 'Ernakulam South', lat: 9.9200, lng: 76.5000, isTerminal: false },
  { name: 'Kadavanthra', lat: 9.9075, lng: 76.5100, isTerminal: false },
  { name: 'Elamkulam', lat: 9.8950, lng: 76.5200, isTerminal: false },
  { name: 'Vytilla', lat: 9.8825, lng: 76.5300, isTerminal: false },
  { name: 'Thykoodam', lat: 9.8700, lng: 76.5400, isTerminal: true }
];

// Full metro route path - will be adjusted based on selection
const getMetroRoute = (hasSelectedRoute: boolean): MapRoute => ({
  id: 'metro-line-1',
  positions: metroStations.map(station => [station.lat, station.lng] as [number, number]),
  color: hasSelectedRoute ? '#e5e7eb' : '#2563eb', // Gray when route is selected, blue otherwise
  weight: hasSelectedRoute ? 4 : 6, // Thinner when route is selected
  opacity: hasSelectedRoute ? 0.4 : 0.8 // More transparent when route is selected
});

export function InteractivePlanMap({ 
  fromStation,
  toStation,
  height = '500px', 
  showControls = true,
  onStationClick,
  onRouteClick 
}: InteractivePlanMapProps) {
  const [selectedFrom, setSelectedFrom] = useState<string | null>(fromStation || null);
  const [selectedTo, setSelectedTo] = useState<string | null>(toStation || null);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update selections when props change
  useEffect(() => {
    console.log('🗺️ InteractivePlanMap: fromStation prop changed to:', fromStation);
    setIsUpdating(true);
    setSelectedFrom(fromStation || null);
    setTimeout(() => setIsUpdating(false), 500); // Reset updating state after 500ms
  }, [fromStation]);

  useEffect(() => {
    console.log('🗺️ InteractivePlanMap: toStation prop changed to:', toStation);
    setIsUpdating(true);
    setSelectedTo(toStation || null);
    setTimeout(() => setIsUpdating(false), 500); // Reset updating state after 500ms
  }, [toStation]);

  // Calculate route when both stations are selected
  useEffect(() => {
    console.log('🗺️ InteractivePlanMap: Calculating route for:', { selectedFrom, selectedTo });
    
    if (selectedFrom && selectedTo) {
      const fromStationData = metroStations.find(s => s.name === selectedFrom);
      const toStationData = metroStations.find(s => s.name === selectedTo);
      
      console.log('🗺️ InteractivePlanMap: Found station data:', { fromStationData, toStationData });
      
      if (fromStationData && toStationData) {
        const fromIndex = metroStations.findIndex(s => s.name === selectedFrom);
        const toIndex = metroStations.findIndex(s => s.name === selectedTo);
        
        console.log('🗺️ InteractivePlanMap: Station indices:', { fromIndex, toIndex });
        
         // Create route path between stations
         const startIndex = Math.min(fromIndex, toIndex);
         const endIndex = Math.max(fromIndex, toIndex);
         const routePath = metroStations.slice(startIndex, endIndex + 1).map(s => [s.lat, s.lng] as [number, number]);
         
         console.log('🗺️ InteractivePlanMap: Route path calculation:', {
           fromIndex,
           toIndex,
           startIndex,
           endIndex,
           routePathLength: routePath.length,
           routePath: routePath
         });
        
        // Calculate journey info
        const distance = Math.abs(toIndex - fromIndex) * 1.2; // Approximate km between stations
        const duration = Math.abs(toIndex - fromIndex) * 2; // Approximate minutes
        const fare = Math.abs(toIndex - fromIndex) * 2; // Approximate fare
        
        const newRouteInfo = {
          from: selectedFrom,
          to: selectedTo,
          distance: distance.toFixed(1),
          duration: duration,
          fare: fare,
          path: routePath
        };
        
        console.log('🗺️ InteractivePlanMap: Setting route info:', newRouteInfo);
        setRouteInfo(newRouteInfo);
      }
    } else {
      console.log('🗺️ InteractivePlanMap: Clearing route info');
      setRouteInfo(null);
    }
  }, [selectedFrom, selectedTo]);

  // Create markers for all stations
  const getAllStationMarkers = (): MapMarker[] => {
    return metroStations.map(station => {
      let markerType: 'station' | 'terminal' = 'station';
      let markerColor = '#2563eb';
      let markerSize = 20;
      
      if (station.name === selectedFrom) {
        markerType = 'terminal';
        markerColor = '#10b981'; // Green for from station
        markerSize = 24;
      } else if (station.name === selectedTo) {
        markerType = 'terminal';
        markerColor = '#dc2626'; // Red for to station
        markerSize = 24;
      } else if (station.isTerminal) {
        markerType = 'terminal';
        markerColor = '#6b7280'; // Gray for other terminals
        markerSize = 20;
      }

      return {
        id: station.name,
        position: [station.lat, station.lng] as [number, number],
        title: station.name,
        description: station.name === selectedFrom ? 'Departure Station' : 
                    station.name === selectedTo ? 'Destination Station' : 'Metro Station',
        type: markerType,
        color: markerColor,
        size: markerSize,
        popup: (
          <div style={{ padding: '8px', fontFamily: 'Arial, sans-serif', minWidth: '200px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
              {station.name}
            </h3>
            <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
              {station.name === selectedFrom ? '🚂 Departure Station' : 
               station.name === selectedTo ? '🏁 Destination Station' : 
               '🚇 Metro Station'}
            </p>
            {station.isTerminal && (
              <p style={{ margin: '0', color: '#10b981', fontSize: '12px', fontWeight: '600' }}>
                TERMINAL STATION
              </p>
            )}
            {routeInfo && (station.name === selectedFrom || station.name === selectedTo) && (
              <div style={{ 
                marginTop: '8px', 
                padding: '6px 8px', 
                background: station.name === selectedFrom ? '#f0fdf4' : '#fef2f2',
                borderRadius: '4px',
                border: `1px solid ${station.name === selectedFrom ? '#10b981' : '#dc2626'}`
              }}>
                <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: station.name === selectedFrom ? '#10b981' : '#dc2626' }}>
                  {station.name === selectedFrom ? 'FROM' : 'TO'}
                </p>
              </div>
            )}
          </div>
        )
      };
    });
  };

  // Get selected route
  const getSelectedRoute = (): MapRoute | undefined => {
    if (!routeInfo) {
      console.log('🗺️ InteractivePlanMap: No route info, returning undefined');
      return undefined;
    }
    
    // Validate route path
    if (!routeInfo.path || routeInfo.path.length < 2) {
      console.error('🗺️ InteractivePlanMap: Invalid route path:', routeInfo.path);
      return undefined;
    }
    
    const route = {
      id: 'selected-route',
      positions: routeInfo.path,
      color: '#10b981',
      weight: 10, // Thicker line
      dashArray: '15, 8', // More prominent dashes
      opacity: 1.0 // Full opacity
    };
    
    console.log('🗺️ InteractivePlanMap: Generated route:', route);
    return route;
  };

  const handleStationClick = (marker: MapMarker) => {
    onStationClick?.(marker);
  };

  const handleRouteClick = (route: MapRoute) => {
    if (routeInfo) {
      onRouteClick?.(routeInfo);
    }
  };

  return (
    <Card variant="elevated" className={styles.mapCard}>
      <div className={styles.mapHeader}>
        <div className={styles.mapTitle}>
          <FaRoute className={styles.mapIcon} />
          <span>Interactive Journey Planner</span>
          {isUpdating && (
            <div style={{ 
              marginLeft: 'auto', 
              fontSize: '12px', 
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                border: '2px solid #10b981',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Updating...
            </div>
          )}
        </div>
        
        {routeInfo && (
          <div className={styles.routeInfo}>
            <div className={styles.routeDetails}>
              <div className={styles.routeDetail}>
                <FaClock className={styles.routeIcon} />
                <span>{routeInfo.duration} mins</span>
              </div>
              <div className={styles.routeDetail}>
                <FaMapMarkerAlt className={styles.routeIcon} />
                <span>{routeInfo.distance} km</span>
              </div>
              <div className={styles.routeDetail}>
                <FaRupeeSign className={styles.routeIcon} />
                <span>₹{routeInfo.fare}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.mapContainer}>
        <LeafletMap
          center={[9.98, 76.45]}
          zoom={12}
          height={height}
          markers={getAllStationMarkers()}
          routes={(() => {
            const metroRoute = getMetroRoute(!!routeInfo);
            const selectedRoute = getSelectedRoute();
            const routes = [metroRoute, ...(selectedRoute ? [selectedRoute] : [])];
            console.log('🗺️ InteractivePlanMap: Rendering routes:', routes);
            return routes;
          })()}
          showControls={showControls}
          onMarkerClick={handleStationClick}
        />
      </div>

      <div className={styles.mapLegend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendMarker} ${styles.from}`}></div>
          <span>Departure Station</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendMarker} ${styles.to}`}></div>
          <span>Destination Station</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendMarker}`}></div>
          <span>Metro Station</span>
        </div>
        {routeInfo && (
          <div className={styles.legendItem}>
            <div style={{ 
              width: '16px', 
              height: '4px', 
              background: '#10b981',
              borderRadius: '2px',
              border: '2px solid #10b981',
              backgroundImage: 'repeating-linear-gradient(90deg, #10b981 0px, #10b981 8px, transparent 8px, transparent 16px)'
            }}></div>
            <span>Your Route</span>
          </div>
        )}
        {!routeInfo && (
          <div className={styles.legendItem}>
            <div style={{ 
              width: '12px', 
              height: '3px', 
              background: '#2563eb',
              borderRadius: '2px'
            }}></div>
            <span>Metro Line</span>
          </div>
        )}
      </div>
    </Card>
  );
}
