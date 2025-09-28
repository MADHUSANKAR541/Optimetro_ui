"use client";

import React from "react";
import Link from "next/link";
import { Parallax } from "react-scroll-parallax";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { FaTrain, FaMapMarkerAlt, FaCog, FaRocket, FaSignInAlt, FaTicketAlt } from "react-icons/fa";
import styles from "./Hero.module.scss";

export function Hero() {
  return (
    <section className={styles.hero}>
      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <Parallax speed={-20} className={styles.parallaxElement}>
          <div className={styles.gradientBlob1} />
        </Parallax>
        <Parallax speed={-15} className={styles.parallaxElement}>
          <div className={styles.gradientBlob2} />
        </Parallax>
        <Parallax speed={-10} className={styles.parallaxElement}>
          <div className={styles.gradientBlob3} />
        </Parallax>
      </div>

      {/* Metro Track - Mobile Only */}
      <div className={styles.metroTrack}>
        <Parallax speed={-3} className={styles.trackLine}>
          <div className={styles.track} />
        </Parallax>
        <div className={styles.trainElement}>
          <div className={styles.trainTrail} />
          <div className={styles.train}>
            <FaTrain className={styles.trainIcon} />
          </div>
        </div>
      </div>

      {/* Right Side Train Tracks - Desktop Only */}
      <div className={styles.rightSideTracks}>
        <div className={styles.rightTrack}>
          <div className={styles.rightTrackLine}>
            <div className={styles.track} />
          </div>
          <div className={styles.rightTrainElement1}>
            <div className={styles.trainComposition}>
              <div className={styles.trainCar}>
                <FaTrain className={styles.trainIcon} />
              </div>
              <div className={styles.trainConnector} />
              <div className={styles.trainCar}></div>
              <div className={styles.trainConnector} />
              <div className={styles.trainCar}></div>
            </div>
          </div>
        </div>
        <div className={styles.rightTrack}>
          <div className={styles.rightTrackLine}>
            <div className={styles.track} />
          </div>
          <div className={styles.rightTrainElement2}>
            <div
              className={`${styles.trainComposition} ${styles.rightTrainComposition}`}
            >
              <div className={styles.trainCar}>
                <FaTrain className={styles.trainIcon} />
              </div>
              <div className={styles.trainConnector} />
              <div className={styles.trainCar}></div>
              <div className={styles.trainConnector} />
              <div className={styles.trainCar}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={styles.textContent}
        >
          <h1 className={styles.title}>
            Your Smart Journey Starts Here with
            <span className={styles.highlight}> Kochi Metro</span>
          </h1>
          <p className={styles.subtitle}>
            Book tickets, plan your journey, and travel smart with Kochi Metro. 
            Real-time updates, easy booking, and seamless travel experience 
            for your daily commute across the city.
          </p>

          <div className={styles.ctaButtons}>
            <Link href="/book-tickets">
              <Button variant="primary" size="lg" icon={<FaTicketAlt />}>
                Book Tickets Now
              </Button>
            </Link>
            <Link href="/commuter/dashboard">
              <Button variant="outline" size="lg" icon={<FaSignInAlt />}>
                Plan Journey
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={styles.visualContent}
        >
          <div className={styles.metroVisual}>
            <div className={styles.station}>
              <FaMapMarkerAlt className={styles.stationIcon} />
              <span>Aluva</span>
            </div>
            <div className={styles.line} />
            <div className={styles.station}>
              <FaMapMarkerAlt className={styles.stationIcon} />
              <span>Thykoodam</span>
            </div>
            <div className={styles.floatingElements}>
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity }}
                className={styles.floatingIcon1}
              >
                <FaRocket />
              </motion.div>
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 4, repeat: Infinity }}
                className={styles.floatingIcon2}
              >
                <FaCog />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className={styles.scrollIndicator}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={styles.scrollArrow}
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  );
}
