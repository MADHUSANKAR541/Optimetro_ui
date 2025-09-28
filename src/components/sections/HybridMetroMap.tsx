'use client';

import React, { useState, useEffect } from 'react';
import { LeafletMetroMap } from './LeafletMetroMap';
import { SimpleFallbackMap } from './SimpleFallbackMap';

export function HybridMetroMap() {
  const [useLeaflet, setUseLeaflet] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to load Leaflet map, fallback to simple map if it fails
    const timer = setTimeout(() => {
      console.log('🗺️ HybridMetroMap: Checking if Leaflet map loaded successfully');
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLeafletError = () => {
    console.log('🗺️ HybridMetroMap: Leaflet map failed, switching to fallback');
    setUseLeaflet(false);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '400px',
        background: '#f3f4f6',
        borderRadius: '8px',
        color: '#6b7280'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading metro map...</p>
        </div>
      </div>
    );
  }

  if (useLeaflet) {
    try {
      return <LeafletMetroMap />;
    } catch (error) {
      console.error('🗺️ HybridMetroMap: Leaflet map error, falling back to simple map:', error);
      return <SimpleFallbackMap />;
    }
  }

  return <SimpleFallbackMap />;
}
