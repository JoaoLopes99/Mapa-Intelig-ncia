import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useDataStore } from '../store/dataStore';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on severity
const getMarkerIcon = (severity: string) => {
  const color = {
    'Baixa': '#10B981',
    'Média': '#F59E0B', 
    'Alta': '#EF4444',
    'Crítica': '#7C2D12'
  }[severity] || '#6B7280';

  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

export const CriminalMap: React.FC = () => {
  const { occurrences } = useDataStore();

  // Center map on São Paulo
  const center: [number, number] = [-23.5505, -46.6333];

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {occurrences.map((occurrence) => (
        <Marker
          key={occurrence.id}
          position={[occurrence.latitude, occurrence.longitude]}
          icon={getMarkerIcon(occurrence.severity)}
        >
          <Popup>
            <div className="p-2">
              <h4 className="font-semibold text-sm">{occurrence.type}</h4>
              <p className="text-xs text-gray-600 mt-1">
                <strong>Unidade:</strong> {occurrence.unit}
              </p>
              <p className="text-xs text-gray-600">
                <strong>Responsável:</strong> {occurrence.responsible}
              </p>
              <p className="text-xs text-gray-600">
                <strong>Gravidade:</strong> 
                <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                  occurrence.severity === 'Crítica' ? 'bg-red-100 text-red-800' :
                  occurrence.severity === 'Alta' ? 'bg-orange-100 text-orange-800' :
                  occurrence.severity === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {occurrence.severity}
                </span>
              </p>
              <p className="text-xs text-gray-600">
                <strong>Status:</strong> {occurrence.status}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};