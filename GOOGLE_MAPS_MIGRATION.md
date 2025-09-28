# Google Maps JavaScript API Migration Guide

## 🗺️ Migration from React-Leaflet to Google Maps

This guide explains how to migrate the Kochi Metro project from React-Leaflet to Google Maps JavaScript API.

## 📋 Prerequisites

1. **Google Cloud Console Setup**
   - Create a Google Cloud project
   - Enable the Maps JavaScript API
   - Create an API key with appropriate restrictions
   - Add your domain to the API key restrictions

2. **Environment Variables**
   ```bash
   # Add to your .env.local file
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
   ```

## 🚀 Installation

1. **Install Dependencies**
   ```bash
   npm install @googlemaps/js-api-loader
   ```

2. **Remove Old Dependencies** (Optional)
   ```bash
   npm uninstall react-leaflet leaflet
   ```

## 🔧 Configuration Changes

### 1. **Map Configuration Updates**
- Updated `src/lib/mapConfig.ts` with Google Maps specific configuration
- Added dark/light theme support with custom map styles
- Configured bounds and restrictions for Kochi Metro area

### 2. **New Components Created**
- `GoogleMapContainer.tsx` - Main map container component
- `GoogleMetroLayers.tsx` - Metro lines and stations layer
- `GoogleRouteLayer.tsx` - Route visualization layer
- `useGoogleMaps.ts` - Custom hook for Google Maps functionality

### 3. **Updated Components**
- Modified `src/app/admin/dashboard/induction/page.tsx` to use Google Maps
- Updated map container styles for Google Maps compatibility

## 🎯 Key Features

### **Enhanced Functionality**
- **Better Performance**: Google Maps provides smoother interactions
- **Advanced Styling**: Custom dark/light themes with detailed styling
- **Rich Info Windows**: Enhanced popups with better formatting
- **Improved Markers**: Custom icons and better visual hierarchy
- **Smooth Animations**: Native Google Maps animations

### **Metro-Specific Features**
- **Station Markers**: Custom metro station icons with accessibility info
- **Route Visualization**: Polylines with click interactions
- **Line Colors**: Kochi Metro brand colors for different lines
- **Interactive Popups**: Rich information windows for stations and routes

## 🔄 Migration Steps

### **Step 1: Update Environment Variables**
```bash
# Add to .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
```

### **Step 2: Install Dependencies**
```bash
npm install @googlemaps/js-api-loader
```

### **Step 3: Update Components**
Replace React-Leaflet components with Google Maps equivalents:

```tsx
// Old (React-Leaflet)
import { MapContainer } from '@/components/maps/MapContainer';
import { MetroLayers } from '@/components/maps/MetroLayers';

// New (Google Maps)
import { GoogleMapContainer } from '@/components/maps/GoogleMapContainer';
import { GoogleMetroLayers } from '@/components/maps/GoogleMetroLayers';
```

### **Step 4: Update Map Usage**
```tsx
// Old
<MapContainer center={[lat, lng]} zoom={12}>
  <MetroLayers lines={lines} stations={stations} />
</MapContainer>

// New
<GoogleMapContainer center={{ lat, lng }} zoom={12}>
  <GoogleMetroLayers map={map} lines={lines} stations={stations} />
</GoogleMapContainer>
```

## 🎨 Styling & Theming

### **Dark/Light Theme Support**
The Google Maps implementation includes comprehensive dark and light theme support:

```tsx
// Automatic theme detection
const { theme } = useTheme();
const isDark = theme === 'dark';

// Custom map styles applied automatically
```

### **Custom Metro Styling**
- **Station Icons**: Custom circular markers with metro branding
- **Line Colors**: Kochi Metro color scheme
- **Info Windows**: Styled popups with metro information
- **Route Visualization**: Enhanced polylines with interactions

## 🔧 API Configuration

### **Google Maps API Setup**
```typescript
const googleMapsConfig = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'geometry'],
  language: 'en',
  region: 'IN'
};
```

### **Map Restrictions**
```typescript
const bounds = {
  north: 10.1,
  south: 9.8,
  east: 76.4,
  west: 76.1
};
```

## 🚀 Performance Benefits

1. **Faster Loading**: Google Maps loads faster than Leaflet
2. **Better Caching**: Improved tile caching and performance
3. **Smooth Interactions**: Native Google Maps interactions
4. **Mobile Optimization**: Better mobile performance and touch support

## 🔒 Security Considerations

1. **API Key Restrictions**
   - Restrict API key to your domain
   - Enable only required APIs (Maps JavaScript API)
   - Set usage quotas and billing alerts

2. **Environment Variables**
   - Never commit API keys to version control
   - Use environment variables for all sensitive data

## 🐛 Troubleshooting

### **Common Issues**

1. **API Key Not Working**
   - Check API key restrictions
   - Verify domain is whitelisted
   - Ensure Maps JavaScript API is enabled

2. **Map Not Loading**
   - Check browser console for errors
   - Verify API key is correctly set
   - Check network connectivity

3. **Styling Issues**
   - Verify theme detection is working
   - Check custom map styles configuration
   - Ensure CSS is properly loaded

## 📚 Additional Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Maps API Key Setup](https://developers.google.com/maps/documentation/javascript/get-api-key)
- [Google Maps Styling Guide](https://developers.google.com/maps/documentation/javascript/style-reference)

## 🔄 Rollback Plan

If you need to rollback to React-Leaflet:

1. Revert component imports
2. Restore original map configuration
3. Reinstall React-Leaflet dependencies
4. Update environment variables

The original React-Leaflet implementation is preserved in the git history for easy rollback.
