export const MAP_CONFIG = {
  defaultCenter: { lat: 9.9312, lng: 76.2673 },
  defaultZoom: 12,
  
  bounds: {
    north: 10.1,
    south: 9.8,
    east: 76.4,
    west: 76.1
  },
  
  lineColors: {
    'Line 1': '#059669', // Emerald
    'Line 2': '#2563eb', // Blue
    'Line 3': '#dc2626', // Red
    'Line 4': '#ea580c', // Orange
    'Line 5': '#7c3aed'  // Purple
  },
  
  statusColors: {
    revenue: '#059669',    // Green
    standby: '#f59e0b',    // Yellow
    IBL: '#3b82f6',        // Blue
    maintenance: '#dc2626', // Red
    active: '#059669',     // Green
    inactive: '#6b7280'    // Gray
  },
  
  alertColors: {
    info: '#3b82f6',       // Blue
    warning: '#f59e0b',    // Yellow
    error: '#dc2626'       // Red
  },
  
  styles: {
    polyline: {
      weight: 6,
      opacity: 0.8,
      color: '#059669',
      lineCap: 'round',
      lineJoin: 'round'
    },
    polylineHover: {
      weight: 8,
      opacity: 1,
      color: '#10b981'
    },
    marker: {
      iconSize: [25, 35],
      iconAnchor: [12, 35],
      popupAnchor: [0, -35]
    },
    cluster: {
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    }
  }
};