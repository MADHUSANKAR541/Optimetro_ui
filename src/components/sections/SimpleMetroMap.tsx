'use client';

import React from 'react';
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

const routeInfo = [
  { icon: <FaRoute />, label: 'Route Length', value: '25.2 km' },
  { icon: <FaMapMarkerAlt />, label: 'Stations', value: '20' },
  { icon: <FaClock />, label: 'Travel Time', value: '45 mins' },
  { icon: <FaUsers />, label: 'Daily Ridership', value: '50,000+' }
];

const stations = [
  { name: 'Aluva', isTerminal: true },
  { name: 'Pulinchodu', isTerminal: false },
  { name: 'Companypady', isTerminal: false },
  { name: 'Ambattukavu', isTerminal: false },
  { name: 'Muttom', isTerminal: false },
  { name: 'Kalamassery', isTerminal: false },
  { name: 'Cochin University', isTerminal: false },
  { name: 'Pathadipalam', isTerminal: false },
  { name: 'Edapally', isTerminal: false },
  { name: 'Changampuzha Park', isTerminal: false },
  { name: 'Palarivattom', isTerminal: false },
  { name: 'JLN Stadium', isTerminal: false },
  { name: 'Kaloor', isTerminal: false },
  { name: 'Town Hall', isTerminal: false },
  { name: 'Maharaja\'s College', isTerminal: false },
  { name: 'Ernakulam South', isTerminal: false },
  { name: 'Kadavanthra', isTerminal: false },
  { name: 'Elamkulam', isTerminal: false },
  { name: 'Vytilla', isTerminal: false },
  { name: 'Thykoodam', isTerminal: true }
];

export function SimpleMetroMap() {
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
            Explore our metro network. The interactive map shows all 20 stations 
            from Aluva to Thykoodam, covering 25.2 km across Kochi.
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

        {/* Metro Route Visualization */}
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
              <span>Kochi Metro Line 1 - Route Map</span>
            </div>
            
            <div className={styles.simpleMapContainer}>
              <div className={styles.routeLine}>
                <div className={styles.lineStart}>Aluva</div>
                <div className={styles.lineMiddle}>→</div>
                <div className={styles.lineEnd}>Thykoodam</div>
              </div>
              
              <div className={styles.stationsGrid}>
                {stations.map((station, index) => (
                  <div 
                    key={index} 
                    className={`${styles.stationItem} ${station.isTerminal ? styles.terminal : styles.intermediate}`}
                  >
                    <div className={styles.stationMarker}></div>
                    <span className={styles.stationName}>{station.name}</span>
                    {station.isTerminal && <span className={styles.terminalLabel}>TERMINAL</span>}
                  </div>
                ))}
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
