'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapCard } from '@/components/maps/MapCard';
import { InteractivePlanMap } from '@/components/maps/InteractivePlanMap';
import { useMapState } from '@/hooks/useMapState';
import { useStations, useMetroLines, useAlerts } from '@/hooks/useMockApi';
import { api } from '@/lib/api';
import { Journey, JourneyStep, Station, MetroLine, MapAlert } from '@/lib/types';
import { 
  FaMapMarkerAlt, 
  FaTrain, 
  FaBus, 
  FaWalking,
  FaClock,
  FaRupeeSign,
  FaArrowRight,
  FaSearch,
  FaLayerGroup,
  FaRoute
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import styles from './plan.module.scss';

const stations = [
  'Aluva', 'Edapally', 'Palarivattom', 'JLN Stadium', 'Kaloor',
  'Town Hall', 'MG Road', 'Maharaja\'s College', 'Ernakulam South',
  'Thykoodam', 'Vytilla', 'SN Junction'
];

export default function PlanTripPage() {
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [showLayers, setShowLayers] = useState(false);

  const { mapState, toggleLayer, selectStation, clearSelection } = useMapState();
  const { data: stationsData = [], loading: stationsLoading } = useStations();
  const { data: linesData = [], loading: linesLoading } = useMetroLines();
  const { data: alertsData = [], loading: alertsLoading } = useAlerts();

  // Debug state changes
  useEffect(() => {
    console.log('🚇 PlanTripPage: fromStation state changed to:', fromStation);
  }, [fromStation]);

  useEffect(() => {
    console.log('🚇 PlanTripPage: toStation state changed to:', toStation);
  }, [toStation]);

  const handlePlanTrip = async () => {
    if (!fromStation || !toStation) {
      toast.error('Please select both departure and arrival stations');
      return;
    }

    if (fromStation === toStation) {
      toast.error('Departure and arrival stations cannot be the same');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/journeys/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromStation,
          to: toStation,
          date: new Date().toISOString().split('T')[0], // Today's date
          time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to plan trip');
      }

      const journeyData = await response.json();
      setJourney(journeyData);
      toast.success(`Trip planned! Train ${journeyData.steps[0]?.trainId} departing at ${journeyData.departureTime}`);
    } catch (error) {
      console.error('Journey planning error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to plan trip');
    } finally {
      setLoading(false);
    }
  };

  const handleStationClick = (station: any) => {
    const stationName = station.title || station.name;
    
    if (!fromStation) {
      setFromStation(stationName);
      toast.success(`Selected departure station: ${stationName}`);
    } else if (!toStation) {
      setToStation(stationName);
      toast.success(`Selected destination station: ${stationName}`);
    } else {
      // If both stations are selected, allow changing them
      if (stationName === fromStation) {
        setFromStation('');
        toast.success(`Cleared departure station`);
      } else if (stationName === toStation) {
        setToStation('');
        toast.success(`Cleared destination station`);
      } else {
        // Replace the from station
        setFromStation(stationName);
        toast.success(`Changed departure station to: ${stationName}`);
      }
    }
  };

  const handleStationHover = (station: Station) => {
  };

  const handleAlertClick = (alert: MapAlert) => {
    toast(`Alert: ${alert.title}`);
  };

  const handleRouteClick = (route: any) => {
    if (route && route.from && route.to) {
      toast.success(`Route: ${route.from} to ${route.to} - ${route.duration} mins, ₹${route.fare}`);
    }
  };

  const clearRoute = () => {
    setJourney(null);
    setFromStation('');
    setToStation('');
    clearSelection();
  };

  const swapStations = () => {
    setFromStation(toStation);
    setToStation(fromStation);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'metro': return <FaTrain />;
      case 'bus': return <FaBus />;
      case 'walk': return <FaWalking />;
      default: return <FaMapMarkerAlt />;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'metro': return '#2563eb';
      case 'bus': return '#059669';
      case 'walk': return '#ea580c';
      default: return '#6b7280';
    }
  };

  return (
    <div className={styles.planTrip}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={styles.header}
      >
        <h1 className={styles.title}>Plan Your Trip</h1>
        <p className={styles.subtitle}>
          Find the best route and get real-time journey information
        </p>
      </motion.div>

      <div className={styles.content}>
        {/* Trip Planner Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card variant="elevated" className={styles.plannerCard}>
            <CardHeader>
              <h2 className={styles.cardTitle}>
                <FaMapMarkerAlt className={styles.cardIcon} />
                Journey Planner
              </h2>
            </CardHeader>
            <CardContent>
              <div className={styles.form}>
                <div className={styles.stationInputs}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      From {fromStation && <span className={styles.selectedStation}>✓ {fromStation}</span>}
                    </label>
                    <select
                      value={fromStation}
                      onChange={(e) => {
                        console.log('🚇 PlanTripPage: From station changed to:', e.target.value);
                        setFromStation(e.target.value);
                      }}
                      className={`${styles.stationSelect} ${fromStation ? styles.selected : ''}`}
                    >
                      <option value="">Select departure station</option>
                      {stations.map(station => (
                        <option key={station} value={station}>{station}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    className={styles.swapButton}
                    onClick={swapStations}
                    title="Swap stations"
                    disabled={!fromStation || !toStation}
                  >
                    <FaArrowRight />
                  </button>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      To {toStation && <span className={styles.selectedStation}>✓ {toStation}</span>}
                    </label>
                    <select
                      value={toStation}
                      onChange={(e) => {
                        console.log('🚇 PlanTripPage: To station changed to:', e.target.value);
                        setToStation(e.target.value);
                      }}
                      className={`${styles.stationSelect} ${toStation ? styles.selected : ''}`}
                    >
                      <option value="">Select arrival station</option>
                      {stations.map(station => (
                        <option key={station} value={station}>{station}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.actionButtons}>
                  <Button
                    variant="primary"
                    size="lg"
                    loading={loading}
                    onClick={handlePlanTrip}
                    icon={<FaSearch />}
                    className={styles.planButton}
                  >
                    Plan Trip
                  </Button>
                  
                  {journey && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={clearRoute}
                      icon={<FaRoute />}
                    >
                      Clear Route
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interactive Map */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <MapCard
            title="Metro Network Map"
            height="500px"
            showHelp={true}
            onHelpClick={() => toast('Click on stations to select origin/destination')}
            actions={
              <div className={styles.mapActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLayers(!showLayers)}
                  icon={<FaLayerGroup />}
                >
                  Layers
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                >
                  {showMap ? 'Hide Map' : 'Show Map'}
                </Button>
              </div>
            }
          >
            {showMap && (
              <div className={styles.mapWrapper}>
                <InteractivePlanMap
                  key={`${fromStation}-${toStation}`} // Force re-render when stations change
                  fromStation={fromStation}
                  toStation={toStation}
                  height="500px"
                  showControls={true}
                  onStationClick={handleStationClick}
                  onRouteClick={handleRouteClick}
                />

                {/* Layer Controls - TODO: Implement Google Maps layer toggles */}
                {showLayers && (
                  <div className={styles.layerControls}>
                    <div style={{ padding: '8px', background: 'var(--color-surface)', borderRadius: '8px' }}>
                      <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                        Layer controls coming soon
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </MapCard>
        </motion.div>

        {/* Journey Results */}
        {journey && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card variant="elevated" className={styles.resultsCard}>
              <CardHeader>
                <h2 className={styles.cardTitle}>
                  <FaClock className={styles.cardIcon} />
                  Journey Details
                </h2>
              </CardHeader>
              <CardContent>
                <div className={styles.journeySummary}>
                  <div className={styles.summaryItem}>
                    <FaClock className={styles.summaryIcon} />
                    <div className={styles.summaryContent}>
                      <div className={styles.summaryLabel}>Total Time</div>
                      <div className={styles.summaryValue}>{journey.totalTime} minutes</div>
                    </div>
                  </div>
                  <div className={styles.summaryItem}>
                    <FaRupeeSign className={styles.summaryIcon} />
                    <div className={styles.summaryContent}>
                      <div className={styles.summaryLabel}>Total Fare</div>
                      <div className={styles.summaryValue}>₹{journey.totalFare}</div>
                    </div>
                  </div>
                  {journey.departureTime && (
                    <div className={styles.summaryItem}>
                      <FaTrain className={styles.summaryIcon} />
                      <div className={styles.summaryContent}>
                        <div className={styles.summaryLabel}>Departure</div>
                        <div className={styles.summaryValue}>{journey.departureTime}</div>
                      </div>
                    </div>
                  )}
                  {journey.arrivalTime && (
                    <div className={styles.summaryItem}>
                      <FaMapMarkerAlt className={styles.summaryIcon} />
                      <div className={styles.summaryContent}>
                        <div className={styles.summaryLabel}>Arrival</div>
                        <div className={styles.summaryValue}>{journey.arrivalTime}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.journeySteps}>
                  <h3 className={styles.stepsTitle}>Journey Steps</h3>
                  {journey.steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={styles.step}
                    >
                      <div className={styles.stepIcon} style={{ color: getStepColor(step.type) }}>
                        {getStepIcon(step.type)}
                      </div>
                      <div className={styles.stepContent}>
                        <div className={styles.stepHeader}>
                          <span className={styles.stepType}>{step.type.toUpperCase()}</span>
                          <span className={styles.stepDuration}>{step.duration} min</span>
                        </div>
                        <div className={styles.stepRoute}>
                          <span className={styles.stepFrom}>{step.from}</span>
                          <FaArrowRight className={styles.stepArrow} />
                          <span className={styles.stepTo}>{step.to}</span>
                        </div>
                        {step.line && (
                          <div className={styles.stepLine}>Line: {step.line}</div>
                        )}
                        {step.platform && (
                          <div className={styles.stepPlatform}>Platform: {step.platform}</div>
                        )}
                        {step.fare && (
                          <div className={styles.stepFare}>Fare: ₹{step.fare}</div>
                        )}
                        {step.trainId && (
                          <div className={styles.trainInfo}>
                            <FaTrain className={styles.trainIcon} />
                            <span className={styles.trainId}>Train: {step.trainId}</span>
                          </div>
                        )}
                        {step.departureTime && step.arrivalTime && (
                          <div className={styles.timeInfo}>
                            <span className={styles.departureTime}>Depart: {step.departureTime}</span>
                            <span className={styles.arrivalTime}>Arrive: {step.arrivalTime}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className={styles.journeyActions}>
                  <Button variant="outline" size="md">
                    Save Trip
                  </Button>
                  <Button variant="primary" size="md">
                    Book Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card variant="elevated" className={styles.tipsCard}>
            <CardHeader>
              <h2 className={styles.cardTitle}>Travel Tips</h2>
            </CardHeader>
            <CardContent>
              <div className={styles.tipsList}>
                <div className={styles.tip}>
                  <div className={styles.tipIcon}>💡</div>
                  <div className={styles.tipContent}>
                    <h4 className={styles.tipTitle}>Peak Hours</h4>
                    <p className={styles.tipDescription}>
                      Avoid traveling during 8-10 AM and 6-8 PM for a more comfortable journey.
                    </p>
                  </div>
                </div>
                <div className={styles.tip}>
                  <div className={styles.tipIcon}>🎫</div>
                  <div className={styles.tipContent}>
                    <h4 className={styles.tipTitle}>Smart Cards</h4>
                    <p className={styles.tipDescription}>
                      Use Kochi Metro smart cards for faster boarding and discounted fares.
                    </p>
                  </div>
                </div>
                <div className={styles.tip}>
                  <div className={styles.tipIcon}>📱</div>
                  <div className={styles.tipContent}>
                    <h4 className={styles.tipTitle}>Real-time Updates</h4>
                    <p className={styles.tipDescription}>
                      Check live train status and platform information before heading to the station.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
