'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  FaPalette, 
  FaFont, 
  FaImage, 
  FaDownload, 
  FaCopy, 
  FaEye,
  FaTrain,
  FaMapMarkerAlt,
  FaCircle,
  FaSquare,
  FaFontAwesome
} from 'react-icons/fa';
import styles from './branding.module.scss';

export default function BrandingPage() {
  const [activeTab, setActiveTab] = useState('colors');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const brandColors = [
    { name: 'Primary Blue', value: '#2563eb', usage: 'Main brand color, CTAs, primary elements' },
    { name: 'Secondary Green', value: '#10b981', usage: 'Success states, positive indicators' },
    { name: 'Accent Orange', value: '#f59e0b', usage: 'Warnings, highlights, alerts' },
    { name: 'Neutral Gray', value: '#6b7280', usage: 'Text, borders, secondary elements' },
    { name: 'Dark Blue', value: '#1e40af', usage: 'Hover states, dark variants' },
    { name: 'Light Blue', value: '#dbeafe', usage: 'Backgrounds, subtle highlights' }
  ];

  const typography = [
    { name: 'Headings', font: 'Inter, system-ui, sans-serif', size: '32px', weight: '700' },
    { name: 'Subheadings', font: 'Inter, system-ui, sans-serif', size: '24px', weight: '600' },
    { name: 'Body Text', font: 'Inter, system-ui, sans-serif', size: '16px', weight: '400' },
    { name: 'Small Text', font: 'Inter, system-ui, sans-serif', size: '14px', weight: '400' },
    { name: 'Captions', font: 'Inter, system-ui, sans-serif', size: '12px', weight: '400' }
  ];

  const logoVariants = [
    { name: 'Primary Logo', description: 'Full color logo for light backgrounds' },
    { name: 'White Logo', description: 'White logo for dark backgrounds' },
    { name: 'Monochrome', description: 'Single color logo for limited color applications' },
    { name: 'Icon Only', description: 'Metro icon without text for small spaces' }
  ];

  const tabs = [
    { id: 'colors', label: 'Colors', icon: <FaPalette /> },
    { id: 'typography', label: 'Typography', icon: <FaFont /> },
    { id: 'logos', label: 'Logos', icon: <FaImage /> },
    { id: 'guidelines', label: 'Guidelines', icon: <FaEye /> }
  ];

  return (
    <div className={styles.branding}>
      <div className={styles.header}>
        <h1 className={styles.title}>Brand Guidelines</h1>
        <p className={styles.subtitle}>
          Comprehensive brand guidelines for Kochi Metro's digital presence
        </p>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'colors' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={styles.section}>
              <CardHeader>
                <h2>Brand Colors</h2>
                <p>Our color palette reflects the energy and reliability of Kochi Metro</p>
              </CardHeader>
              <CardContent>
                <div className={styles.colorGrid}>
                  {brandColors.map((color, index) => (
                    <div key={index} className={styles.colorCard}>
                      <div 
                        className={styles.colorSwatch}
                        style={{ backgroundColor: color.value }}
                        onClick={() => copyToClipboard(color.value, color.name)}
                      >
                        <FaCopy className={styles.copyIcon} />
                      </div>
                      <div className={styles.colorInfo}>
                        <h3>{color.name}</h3>
                        <p className={styles.colorValue}>{color.value}</p>
                        <p className={styles.colorUsage}>{color.usage}</p>
                        {copiedText === color.name && (
                          <span className={styles.copied}>Copied!</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'typography' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={styles.section}>
              <CardHeader>
                <h2>Typography</h2>
                <p>Consistent typography creates a professional and accessible experience</p>
              </CardHeader>
              <CardContent>
                <div className={styles.typographyGrid}>
                  {typography.map((type, index) => (
                    <div key={index} className={styles.typeCard}>
                      <div className={styles.typePreview}>
                        <span 
                          style={{ 
                            fontFamily: type.font,
                            fontSize: type.size,
                            fontWeight: type.weight
                          }}
                        >
                          The quick brown fox jumps over the lazy dog
                        </span>
                      </div>
                      <div className={styles.typeInfo}>
                        <h3>{type.name}</h3>
                        <p>Font: {type.font}</p>
                        <p>Size: {type.size}</p>
                        <p>Weight: {type.weight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'logos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={styles.section}>
              <CardHeader>
                <h2>Logo Usage</h2>
                <p>Proper logo usage ensures brand consistency across all touchpoints</p>
              </CardHeader>
              <CardContent>
                <div className={styles.logoGrid}>
                  {logoVariants.map((variant, index) => (
                    <div key={index} className={styles.logoCard}>
                      <div className={styles.logoPreview}>
                        <div className={styles.logoPlaceholder}>
                          <FaTrain className={styles.logoIcon} />
                          <span>KMRL</span>
                        </div>
                      </div>
                      <div className={styles.logoInfo}>
                        <h3>{variant.name}</h3>
                        <p>{variant.description}</p>
                        <Button variant="outline" size="sm">
                          <FaDownload />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'guidelines' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.guidelinesGrid}>
              <Card className={styles.guidelineCard}>
                <CardHeader>
                  <h2>Brand Voice</h2>
                </CardHeader>
                <CardContent>
                  <ul>
                    <li><strong>Professional:</strong> Clear, concise, and authoritative</li>
                    <li><strong>Accessible:</strong> Easy to understand for all users</li>
                    <li><strong>Reliable:</strong> Consistent and trustworthy messaging</li>
                    <li><strong>Modern:</strong> Forward-thinking and innovative</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className={styles.guidelineCard}>
                <CardHeader>
                  <h2>Visual Principles</h2>
                </CardHeader>
                <CardContent>
                  <ul>
                    <li><strong>Clean Design:</strong> Minimal, uncluttered interfaces</li>
                    <li><strong>Consistent Spacing:</strong> Use design system spacing</li>
                    <li><strong>High Contrast:</strong> Ensure accessibility compliance</li>
                    <li><strong>Mobile First:</strong> Responsive design principles</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className={styles.guidelineCard}>
                <CardHeader>
                  <h2>Usage Guidelines</h2>
                </CardHeader>
                <CardContent>
                  <ul>
                    <li>Always maintain logo proportions</li>
                    <li>Use brand colors consistently</li>
                    <li>Follow accessibility guidelines (WCAG 2.1)</li>
                    <li>Test across different devices and browsers</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className={styles.guidelineCard}>
                <CardHeader>
                  <h2>Download Assets</h2>
                </CardHeader>
                <CardContent>
                  <div className={styles.downloadSection}>
                    <Button variant="primary" size="lg">
                      <FaDownload />
                      Brand Kit (ZIP)
                    </Button>
                    <Button variant="outline" size="lg">
                      <FaImage />
                      Logo Pack
                    </Button>
                    <Button variant="outline" size="lg">
                      <FaFontAwesome />
                      Font Files
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
