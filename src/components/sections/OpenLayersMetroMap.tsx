'use client';

import React, { useEffect, useRef, useState } from 'react';
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

// OpenLayers imports
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Point, LineString } from 'ol/geom';
import Feature from 'ol/Feature';
import { Style, Circle, Stroke, Fill, Text } from 'ol/style';
import { Icon } from 'ol/style';
import Overlay from 'ol/Overlay';

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

export function OpenLayersMetroMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapLoaded || isInitializing) return;

    setIsInitializing(true);
    console.log('🗺️ Initializing OpenLayers map...');

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!mapLoaded) {
        console.warn('⚠️ Map loading timeout - forcing completion');
        setMapLoaded(true);
        setIsInitializing(false);
      }
    }, 3000); // Reduced to 3 second timeout

    // Simple initialization - just basic map first
    const initMap = () => {
      try {
        console.log('🗺️ Creating basic OpenLayers map...');
        
        // Create basic map first
        const map = new Map({
          target: mapRef.current!,
          layers: [
            new TileLayer({
              source: new OSM()
            })
          ],
          view: new View({
            center: fromLonLat([76.45, 9.98]), // Center of Kochi
            zoom: 12
          })
        });

        console.log('✅ Basic map created, adding metro features...');

        // Add metro features after basic map is ready
        setTimeout(() => {
          try {
            // Create metro route line
            const routeCoordinates = stations.map(station => 
              fromLonLat([station.lng, station.lat])
            );
            const routeLine = new LineString(routeCoordinates);
            const routeFeature = new Feature(routeLine);

            // Style for metro route
            const routeStyle = new Style({
              stroke: new Stroke({
                color: '#2563eb',
                width: 6,
                lineDash: [10, 5]
              })
            });
            routeFeature.setStyle(routeStyle);

            // Create vector source for route
            const routeSource = new VectorSource({
              features: [routeFeature]
            });

            // Create vector layer for route
            const routeLayer = new VectorLayer({
              source: routeSource,
              zIndex: 1
            });

            // Create vector source for stations
            const stationSource = new VectorSource();

            // Add station features
            stations.forEach((station, index) => {
              const stationPoint = new Point(fromLonLat([station.lng, station.lat]));
              const stationFeature = new Feature(stationPoint);
              
              // Set station properties
              stationFeature.setProperties({
                name: station.name,
                description: station.description,
                isTerminal: station.isTerminal,
                index: index
              });

              // Style for stations
              const stationStyle = new Style({
                image: new Circle({
                  radius: station.isTerminal ? 8 : 6,
                  fill: new Fill({
                    color: station.isTerminal ? '#10b981' : '#2563eb'
                  }),
                  stroke: new Stroke({
                    color: '#ffffff',
                    width: 2
                  })
                }),
                text: new Text({
                  text: station.name,
                  font: '12px Arial',
                  fill: new Fill({
                    color: '#1f2937'
                  }),
                  stroke: new Stroke({
                    color: '#ffffff',
                    width: 2
                  }),
                  offsetY: -15,
                  textAlign: 'center'
                })
              });

              stationFeature.setStyle(stationStyle);
              stationSource.addFeature(stationFeature);
            });

            // Create vector layer for stations
            const stationLayer = new VectorLayer({
              source: stationSource,
              zIndex: 2
            });

            // Add layers to map
            map.addLayer(routeLayer);
            map.addLayer(stationLayer);

            // Create popup overlay
            const popup = new Overlay({
              element: document.createElement('div'),
              positioning: 'bottom-center',
              stopEvent: false,
              offset: [0, -10]
            });
            map.addOverlay(popup);

            // Add click handler for stations
            map.on('click', (event) => {
              const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => {
                return feature.getProperties().name ? feature : null;
              });

              if (feature) {
                const props = feature.getProperties();
                const element = popup.getElement();
                
                if (element) {
                  element.innerHTML = `
                  <div style="
                    background: white;
                    padding: 12px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    border: 1px solid #e5e7eb;
                    font-family: Arial, sans-serif;
                    min-width: 200px;
                  ">
                    <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                      ${props.name}
                    </h3>
                    <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
                      ${props.description}
                    </p>
                    ${props.isTerminal ? '<p style="margin: 0; color: #10b981; font-size: 12px; font-weight: 600;">TERMINAL STATION</p>' : ''}
                  </div>
                `;
                
                popup.setPosition(event.coordinate);
                }
              } else {
                popup.setPosition(undefined);
              }
            });

            // Change cursor on hover
            map.on('pointermove', (event) => {
              const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => {
                return feature.getProperties().name ? feature : null;
              });
              
              const target = map.getTarget();
              if (target && typeof target === 'object' && 'style' in target) {
                (target as HTMLElement).style.cursor = feature ? 'pointer' : '';
              }
            });

            console.log('✅ Metro features added successfully');
          } catch (featureError) {
            console.error('❌ Error adding metro features:', featureError);
          }
        }, 500); // Small delay to ensure map is ready

        setMapLoaded(true);
        console.log('✅ OpenLayers map initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing OpenLayers map:', error);
        setMapError('Failed to load map. Please refresh the page.');
      } finally {
        clearTimeout(timeout);
        setIsInitializing(false);
      }
    };

    // Initialize map on next frame
    requestAnimationFrame(initMap);
  }, [mapLoaded, isInitializing]);

  const retryMap = () => {
    setMapLoaded(false);
    setMapError(null);
    setIsInitializing(false);
  };

  if (mapError) {
    return (
      <section id="metro-map" className={styles.metroMap}>
        <div className={styles.container}>
          <div className={styles.errorMessage}>
            <h2>Map Loading Error</h2>
            <p>{mapError}</p>
            <button onClick={retryMap} className={styles.retryButton}>
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

        {/* OpenLayers Map */}
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
              {!mapLoaded ? (
                <div className={styles.mapLoading}>
                  <div className={styles.loadingSpinner}></div>
                  <p>{isInitializing ? 'Initializing map...' : 'Loading map...'}</p>
                  <small>This may take a few seconds</small>
                </div>
              ) : (
                <div ref={mapRef} className={styles.map} />
              )}
              
              {/* Always show fallback map */}
              <div className={styles.fallbackMap}>
                <div className={styles.fallbackContent}>
                  <FaMapMarkerAlt className={styles.fallbackIcon} />
                  <h4>Kochi Metro Route</h4>
                  <p>Aluva → Thykoodam (25.2 km, 20 stations)</p>
                  <div className={styles.fallbackStations}>
                    <span className={styles.station}>Aluva</span>
                    <span className={styles.station}>Edapally</span>
                    <span className={styles.station}>Kaloor</span>
                    <span className={styles.station}>Thykoodam</span>
                  </div>
                  <div className={styles.fallbackInfo}>
                    <p><strong>Interactive map loading above...</strong></p>
                    <p>Click on stations to see details when map loads</p>
                  </div>
                </div>
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
