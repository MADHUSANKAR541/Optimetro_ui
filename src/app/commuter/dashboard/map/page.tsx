'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CommuterDashboardMap } from '@/components/maps/CommuterDashboardMap';
import { RealtimeTrackingMap } from '@/components/maps/RealtimeTrackingMap';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FaMapMarkerAlt, FaTrain, FaRoute, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import styles from './map.module.scss';

export default function CommuterMapPage() {
  const [activeTab, setActiveTab] = useState<'plan' | 'track'>('plan');

  return (
    <div className={styles.commuterMap}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={styles.header}
      >
        <h1 className={styles.title}>Metro Maps & Navigation</h1>
        <p className={styles.subtitle}>
          Plan your journey and track trains in real-time
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={styles.tabNavigation}
      >
        <button
          className={`${styles.tab} ${activeTab === 'plan' ? styles.active : ''}`}
          onClick={() => setActiveTab('plan')}
        >
          <FaRoute className={styles.tabIcon} />
          <span>Plan Journey</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'track' ? styles.active : ''}`}
          onClick={() => setActiveTab('track')}
        >
          <FaTrain className={styles.tabIcon} />
          <span>Track Trains</span>
        </button>
      </motion.div>

      {/* Map Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={styles.mapContent}
      >
        {activeTab === 'plan' && (
          <CommuterDashboardMap
            height="600px"
            showControls={true}
            onStationClick={(station) => {
              console.log('Station clicked:', station);
              toast.success(`Station: ${station.title}`);
            }}
            onRouteClick={(route) => {
              console.log('Route clicked:', route);
              toast.success(`Route: ${route.name}`);
            }}
          />
        )}

        {activeTab === 'track' && (
          <RealtimeTrackingMap
            height="600px"
            showControls={true}
            onTrainClick={(train) => {
              console.log('Train clicked:', train);
              toast.success(`Train: ${train.title}`);
            }}
          />
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className={styles.quickActions}
      >
        <Card variant="elevated" className={styles.actionsCard}>
          <h3 className={styles.actionsTitle}>Quick Actions</h3>
          <div className={styles.actionButtons}>
            <Button
              variant="primary"
              size="lg"
              icon={<FaMapMarkerAlt />}
              onClick={() => toast.success('Finding nearest station...')}
            >
              Find Nearest Station
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={<FaRoute />}
              onClick={() => toast.success('Opening route planner...')}
            >
              Plan Route
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={<FaClock />}
              onClick={() => toast.success('Checking schedules...')}
            >
              Check Schedule
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
