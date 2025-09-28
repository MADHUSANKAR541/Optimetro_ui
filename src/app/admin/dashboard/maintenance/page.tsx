'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapCard } from '@/components/maps/MapCard';
import { AdminDashboardMap } from '@/components/maps/AdminDashboardMap';
import { useMapState } from '@/hooks/useMapState';
import { useStations, useMetroLines, useAlerts, useMaintenanceRecords } from '@/hooks/useSupabaseApi';
import { MaintenanceRecord, Station, MetroLine, MapAlert } from '@/lib/types';
import { 
  FaWrench, 
  FaCheckCircle, 
  FaClock, 
  FaMapMarkerAlt,
  FaLayerGroup,
  FaEye,
  FaEyeSlash,
  FaTools,
  FaExclamationTriangle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import styles from './maintenance.module.scss';

export default function MaintenancePage() {
  const { data: maintenanceRecordsData, loading } = useMaintenanceRecords();
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [showLayers, setShowLayers] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { mapState, toggleLayer, selectAlert, clearSelection } = useMapState();
  const { data: stationsData, loading: stationsLoading } = useStations();
  const { data: linesData, loading: linesLoading } = useMetroLines();
  const { data: alertsData, loading: alertsLoading } = useAlerts();

  useEffect(() => {
    if (Array.isArray(maintenanceRecordsData)) {
      setMaintenanceRecords(maintenanceRecordsData as MaintenanceRecord[]);
    }
  }, [maintenanceRecordsData]);

  const handleRecordClick = (record: MaintenanceRecord) => {
    setSelectedRecord(record.id);
    toast(`Selected maintenance: ${record.description}`);
  };

  const handleTrainClick = (train: any) => {
    toast.success(`Train: ${train.title || train.name || 'Unknown'}`);
  };

  const handleAlertClick = (alert: MapAlert) => {
    toast.success(`Alert: ${alert.title}`);
  };

  const handleStationClick = (station: Station) => {
    toast.success(`Station: ${station.name}`);
  };

  const handleCompleteMaintenance = async (recordId: string) => {
    try {
      setMaintenanceRecords(prev => prev.map(record => 
        record.id === recordId 
          ? { ...record, status: 'completed' as const, completedDate: new Date().toISOString() }
          : record
      ));
      toast.success('Maintenance completed successfully!');
    } catch (error) {
      toast.error('Failed to complete maintenance');
    }
  };


  const getMaintenanceIcon = (type: string) => {
    switch (type) {
      case 'preventive': return <FaTools />;
      case 'corrective': return <FaWrench />;
      case 'emergency': return <FaExclamationTriangle />;
      default: return <FaWrench />;
    }
  };

  const getMaintenanceColor = (type: string) => {
    switch (type) {
      case 'preventive': return styles.preventive;
      case 'corrective': return styles.corrective;
      case 'emergency': return styles.emergency;
      default: return styles.default;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return styles.scheduled;
      case 'in_progress': return styles.inProgress;
      case 'completed': return styles.completed;
      default: return styles.default;
    }
  };

  const filteredRecords = (Array.isArray(maintenanceRecords) ? maintenanceRecords : []).filter(record => {
    if (filterStatus === 'all') return true;
    return record.status === filterStatus;
  });

  const getAffectedStations = (record: MaintenanceRecord) => {
    if (!stationsData || !Array.isArray(stationsData)) {
      return [];
    }
    return stationsData.filter(station =>
      record.trainId.includes(station.id) || station.name.includes(record.trainId)
    );
  };

  return (
    <div className={styles.maintenance}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={styles.header}
      >
        <h1 className={styles.title}>Maintenance Management</h1>
        <p className={styles.subtitle}>
          Track and manage maintenance activities across the metro network
        </p>
      </motion.div>

      <div className={styles.content}>
        {/* Spotlight Map */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <MapCard
            title="Maintenance Spotlight Map"
            height="500px"
            showHelp={true}
            onHelpClick={() => toast('Click on maintenance records to highlight affected areas on the map')}
            actions={
              <div className={styles.mapActions}>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={styles.statusFilter}
                >
                  <option value="all">All Records</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
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
                  icon={showMap ? <FaEyeSlash /> : <FaEye />}
                >
                  {showMap ? 'Hide Map' : 'Show Map'}
                </Button>
              </div>
            }
          >
            {showMap && (
              <div className={styles.mapWrapper}>
                <AdminDashboardMap
                  height="500px"
                  showControls={true}
                  onStationClick={handleStationClick}
                  onTrainClick={handleTrainClick}
                  onAlertClick={handleAlertClick}
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

        {/* Maintenance Records List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card variant="elevated" className={styles.recordsCard}>
            <CardHeader>
              <h2 className={styles.cardTitle}>
                <FaWrench className={styles.cardIcon} />
                Maintenance Records ({filteredRecords.length})
              </h2>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className={styles.skeleton}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className={styles.skeletonItem} />
                  ))}
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className={styles.emptyState}>
                  <FaWrench className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>No Maintenance Records</h3>
                  <p className={styles.emptyDescription}>
                    No maintenance records found for the selected filter.
                  </p>
                </div>
              ) : (
                <div className={styles.recordsList}>
                  {filteredRecords.map((record, index) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`${styles.recordItem} ${getMaintenanceColor(record.type)} ${selectedRecord === record.id ? styles.selected : ''}`}
                      onClick={() => handleRecordClick(record)}
                    >
                      <div className={styles.recordHeader}>
                        <div className={styles.recordInfo}>
                          <div className={styles.recordIcon}>
                            {getMaintenanceIcon(record.type)}
                          </div>
                          <div className={styles.recordDetails}>
                            <h3 className={styles.recordTitle}>{record.description}</h3>
                            <div className={styles.recordMeta}>
                              <span className={styles.recordType}>
                                {record.type.toUpperCase()}
                              </span>
                              <span className={styles.trainId}>
                                {record.trainId}
                              </span>
                              <span className={styles.assignedTo}>
                                {record.assignedTo}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.recordStatus}>
                          <span className={`${styles.statusBadge} ${getStatusColor(record.status)}`}>
                            {record.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className={styles.recordBody}>
                        <div className={styles.recordDates}>
                          <div className={styles.dateItem}>
                            <span className={styles.dateLabel}>Scheduled:</span>
                            <span className={styles.dateValue}>
                              {new Date(record.scheduledDate).toLocaleDateString()}
                            </span>
                          </div>
                          {record.completedDate && (
                            <div className={styles.dateItem}>
                              <span className={styles.dateLabel}>Completed:</span>
                              <span className={styles.dateValue}>
                                {new Date(record.completedDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className={styles.recordActions}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteMaintenance(record.id);
                            }}
                            disabled={record.status === 'completed'}
                            icon={<FaCheckCircle />}
                          >
                            {record.status === 'completed' ? 'Completed' : 'Mark Complete'}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
