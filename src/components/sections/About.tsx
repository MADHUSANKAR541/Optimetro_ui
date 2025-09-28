'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { 
  FaTrain, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaRocket, 
  FaGlobe
} from 'react-icons/fa';
import styles from './About.module.scss';

const stats = [
  { icon: <FaTrain />, value: '25+', label: 'Trains Daily' },
  { icon: <FaMapMarkerAlt />, value: '12', label: 'Stations' },
  { icon: <FaUsers />, value: '50K+', label: 'Daily Commuters' },
  { icon: <FaRocket />, value: '99.5%', label: 'On-Time Service' }
];


export function About() {
  return (
    <section id="about" className={styles.about}>
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={styles.header}
        >
          <h2 className={styles.title}>About Kochi Metro</h2>
          <p className={styles.subtitle}>
            Connecting Kochi with modern, efficient, and comfortable metro services. 
            Your reliable partner for daily commuting across the city with smart features 
            and digital convenience.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className={styles.statsSection}
        >
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={styles.statCard}
              >
                <div className={styles.statIcon}>{stat.icon}</div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission & Vision */}
        <div className={styles.missionVision}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className={styles.missionCard}
          >
            <Card variant="elevated" className={styles.card}>
              <div className={styles.cardIcon}>
                <FaRocket />
              </div>
              <h3 className={styles.cardTitle}>Our Mission</h3>
              <p className={styles.cardDescription}>
              To provide safe, reliable, and comfortable metro services that connect Kochi efficiently. 
              We're committed to making your daily commute smooth, affordable, and environmentally friendly 
              with modern technology and excellent customer service.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className={styles.visionCard}
          >
            <Card variant="elevated" className={styles.card}>
              <div className={styles.cardIcon}>
                <FaGlobe />
              </div>
              <h3 className={styles.cardTitle}>Our Vision</h3>
              <p className={styles.cardDescription}>
              To be Kochi's preferred mode of transportation, offering world-class metro services 
              that are accessible, affordable, and sustainable. We envision a connected city where 
              every journey is comfortable, safe, and environmentally conscious.
              </p>
            </Card>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
