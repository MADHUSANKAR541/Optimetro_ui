'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { 
  FaUsers, 
  FaTicketAlt, 
  FaMapMarkerAlt, 
  FaCog, 
  FaRocket 
} from 'react-icons/fa';
import styles from './Features.module.scss';

const features = [
  {
    icon: <FaTicketAlt />,
    title: 'Easy Ticket Booking',
    description: 'Book your metro tickets in seconds with our simple, user-friendly booking system. No queues, no hassle.'
  },
  {
    icon: <FaMapMarkerAlt />,
    title: 'Smart Journey Planning',
    description: 'Plan your route with real-time updates, station information, and the best travel options for your destination.'
  },
  {
    icon: <FaRocket />,
    title: 'Real-Time Updates',
    description: 'Get instant notifications about train delays, platform changes, and service updates directly to your phone.'
  },
  {
    icon: <FaUsers />,
    title: 'Comfortable Travel',
    description: 'Enjoy air-conditioned coaches, comfortable seating, and a smooth ride experience across all metro stations.'
  },
  {
    icon: <FaCog />,
    title: 'Smart Features',
    description: 'Access live train tracking, station facilities, parking information, and connect with other transport modes.'
  },
  {
    icon: <FaRocket />,
    title: 'Digital Convenience',
    description: 'Mobile tickets, digital payments, and paperless travel with our integrated digital metro experience.'
  }
];

export function Features() {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={styles.header}
        >
          <h2 className={styles.title}>Why Choose Kochi Metro?</h2>
          <p className={styles.subtitle}>
            Experience modern urban transportation with smart features, 
            comfortable travel, and digital convenience designed for your daily commute.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card variant="elevated" hover className={styles.featureCard}>
                <div className={styles.iconContainer}>
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
