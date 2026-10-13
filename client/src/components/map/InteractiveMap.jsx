import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default marker icons in Vite/bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom pin icons
const createCustomIcon = (color, text = '') => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 11px;
        ">${text}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const vehicleIcon = L.divIcon({
  className: 'vehicle-div-icon',
  html: `
    <div style="
      background-color: #0284c7;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 12px #38bdf8;
      border: 2px solid white;
      animation: pulse 1.5s infinite;
    ">
      <span style="font-size: 14px;">🚗</span>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Auto-fit bounds component
const AutoFitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [bounds, map]);
  return null;
};

// Map click event listener
const MapEvents = ({ onMapClick }) => {
  const map = useMap();
  useEffect(() => {
    if (!onMapClick) return;
    const handleClick = (e) => {
      onMapClick(e.latlng);
    };
    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [map, onMapClick]);
  return null;
};

export const InteractiveMap = ({
  center = [20.5937, 78.9629],
  zoom = 5,
  routes = [],
  selectedRouteIndex = 0,
  origin,
  destination,
  liveLocation,
  onMapClick,
  enableTravelingMarker = false,
  className = 'h-96 w-full rounded-2xl overflow-hidden'
}) => {
  const [vehiclePos, setVehiclePos] = useState(null);
  const stepRef = useRef(0);

  // GeoJSON coordinates are [lng, lat], Leaflet polyline expects [lat, lng]
  const selectedRoute = routes[selectedRouteIndex] || routes[0];
  const polylinePositions = selectedRoute?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]) || [];

  // Traveling vehicle loop animation along selected route
  useEffect(() => {
    if (!enableTravelingMarker || polylinePositions.length === 0) {
      setVehiclePos(null);
      return;
    }

    stepRef.current = 0;
    const interval = setInterval(() => {
      stepRef.current = (stepRef.current + 1) % polylinePositions.length;
      setVehiclePos(polylinePositions[stepRef.current]);
    }, 200);

    return () => clearInterval(interval);
  }, [enableTravelingMarker, selectedRouteIndex, polylinePositions.length]);

  // Compute bounding box
  const bounds = [];
  if (origin) bounds.push([origin.lat, origin.lng]);
  if (destination) bounds.push([destination.lat, destination.lng]);
  if (polylinePositions.length > 0) {
    polylinePositions.forEach((pt) => bounds.push(pt));
  }

  const defaultCenter = origin ? [origin.lat, origin.lng] : center;

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {onMapClick && <MapEvents onMapClick={onMapClick} />}
        {bounds.length > 1 && <AutoFitBounds bounds={bounds} />}

        {/* Alternative routes polyline */}
        {routes.map((route, idx) => {
          if (idx === selectedRouteIndex) return null;
          const altPositions = route.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]) || [];
          return (
            <Polyline
              key={idx}
              positions={altPositions}
              pathOptions={{ color: '#94a3b8', weight: 4, dashArray: '6, 8', opacity: 0.6 }}
            />
          );
        })}

        {/* Selected route polyline */}
        {polylinePositions.length > 0 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#0284c7',
              weight: 6,
              opacity: 0.85
            }}
          />
        )}

        {/* Origin Pin */}
        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={createCustomIcon('#10b981', 'A')}>
            <Popup>
              <strong>Start:</strong> {origin.name}
            </Popup>
          </Marker>
        )}

        {/* Destination Pin */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={createCustomIcon('#f59e0b', 'B')}>
            <Popup>
              <strong>Destination:</strong> {destination.name}
            </Popup>
          </Marker>
        )}

        {/* Traveling loop vehicle marker */}
        {enableTravelingMarker && vehiclePos && (
          <Marker position={vehiclePos} icon={vehicleIcon} />
        )}

        {/* Real-time live geolocation marker */}
        {liveLocation && (
          <Marker
            position={[liveLocation.lat, liveLocation.lng]}
            icon={createCustomIcon('#ef4444', '📍')}
          >
            <Popup>
              <strong>Your Live Location</strong>
              <br />
              Speed: {liveLocation.speedKmh ? `${Math.round(liveLocation.speedKmh)} km/h` : 'Stopped'}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
