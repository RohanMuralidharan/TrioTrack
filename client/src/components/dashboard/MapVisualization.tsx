import { useState, Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Define map data types
interface GeoFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    id: string;
    name: string;
    district: string;
    airQuality: {
      aqi: number;
      status: string;
      color: string;
    };
    traffic: {
      congestionLevel: number;
      status: string;
      color: string;
    };
  };
}

interface MapDataResponse {
  type: string;
  features: GeoFeature[];
}

// Fix for Leaflet default icon paths
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper functions for map data visualization
function getAirQualityColor(aqi: number): string {
  if (aqi <= 50) return '#10b981'; // green-500
  if (aqi <= 100) return '#f59e0b'; // yellow-500
  if (aqi <= 150) return '#f97316'; // orange-500
  if (aqi <= 200) return '#ef4444'; // red-500
  if (aqi <= 300) return '#a855f7'; // purple-500
  return '#be123c'; // rose-900
}

function getAirQualityDescription(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getTrafficColor(congestion: number): string {
  if (congestion <= 30) return '#10b981'; // green-500
  if (congestion <= 60) return '#f59e0b'; // yellow-500
  if (congestion <= 80) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

function getTrafficDescription(congestion: number): string {
  if (congestion <= 30) return 'Light traffic';
  if (congestion <= 60) return 'Moderate congestion';
  if (congestion <= 80) return 'Heavy traffic';
  return 'Severe congestion';
}

interface MapVisualizationProps {
  height?: string;
  fullWidth?: boolean;
}

export default function MapVisualization({ 
  height = 'h-[600px]',
  fullWidth = false
}: MapVisualizationProps) {
  const [layers, setLayers] = useState({
    air: true,
    traffic: true,
    flooding: false
  });

  const { data: mapData, isLoading } = useQuery<MapDataResponse>({
    queryKey: ['/api/map/data'],
    staleTime: 300000, // 5 minutes
  });

  const toggleLayer = (layerName: keyof typeof layers) => {
    setLayers(prevLayers => ({
      ...prevLayers,
      [layerName]: !prevLayers[layerName]
    }));
  };
  
  // Default city coordinates (NYC area)
  const defaultPosition: [number, number] = [40, -74.5];
  const defaultZoom = 11;

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${fullWidth ? 'w-full' : ''}`}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">City Map & Data Overlay</h3>
        <div>
          <div className="flex space-x-2">
            <div>
              <input 
                id="air" 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" 
                checked={layers.air}
                onChange={() => toggleLayer('air')}
              />
              <label htmlFor="air" className="ml-1 text-sm text-gray-700">Air Quality</label>
            </div>
            <div>
              <input 
                id="traffic" 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" 
                checked={layers.traffic}
                onChange={() => toggleLayer('traffic')}
              />
              <label htmlFor="traffic" className="ml-1 text-sm text-gray-700">Traffic</label>
            </div>
            <div>
              <input 
                id="flooding" 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" 
                checked={layers.flooding}
                onChange={() => toggleLayer('flooding')}
              />
              <label htmlFor="flooding" className="ml-1 text-sm text-gray-700">Flooding</label>
            </div>
          </div>
        </div>
      </div>
      <div className={`relative ${height}`}>
        {/* React Leaflet Map */}
        <MapContainer 
          center={defaultPosition} 
          zoom={defaultZoom} 
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Air Quality Markers */}
          {layers.air && mapData?.features?.map((feature) => (
            <CircleMarker
              key={`air-${feature.properties.id}`}
              center={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
              radius={25}
              pathOptions={{
                fillColor: feature.properties.airQuality.color,
                fillOpacity: 0.6,
                stroke: false
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-medium">{feature.properties.name}</h3>
                  <p className="text-sm">Air Quality Index: {feature.properties.airQuality.aqi}</p>
                  <p className="text-xs text-gray-500">{feature.properties.airQuality.status}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          
          {/* Traffic Markers */}
          {layers.traffic && mapData?.features?.map((feature) => 
            feature.properties.traffic.congestionLevel > 50 && (
              <CircleMarker
                key={`traffic-${feature.properties.id}`}
                center={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
                radius={15}
                pathOptions={{
                  fillColor: feature.properties.traffic.color,
                  fillOpacity: 0.6,
                  stroke: false
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-medium">{feature.properties.name}</h3>
                    <p className="text-sm">Traffic Congestion: {feature.properties.traffic.congestionLevel}%</p>
                    <p className="text-xs text-gray-500">{feature.properties.traffic.status}</p>
                  </div>
                </Popup>
              </CircleMarker>
            )
          )}
        </MapContainer>
        
        {/* Map Legend */}
        <div className="absolute bottom-5 right-5 bg-white p-3 rounded-lg shadow-md z-10 text-xs">
          <div className="font-medium mb-1 text-gray-700">Map Legend</div>
          <div className="flex items-center mt-1">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
            <span>Good Air Quality (0-50)</span>
          </div>
          <div className="flex items-center mt-1">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
            <span>Moderate (51-100)</span>
          </div>
          <div className="flex items-center mt-1">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1"></span>
            <span>Unhealthy for Sensitive Groups (101-150)</span>
          </div>
          <div className="flex items-center mt-1">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
            <span>Unhealthy (151-200)</span>
          </div>
          <div className="flex items-center mt-1">
            <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-1"></span>
            <span>Very Unhealthy (201-300)</span>
          </div>
          <div className="flex items-center mt-1">
            <span className="inline-block w-3 h-3 rounded-full bg-rose-900 mr-1"></span>
            <span>Hazardous (301+)</span>
          </div>
        </div>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
