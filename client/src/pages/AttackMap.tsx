import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { mockAlerts } from '@/lib/mockData';
import type { Alert, SeverityLevel } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
const DefaultIcon = L.Icon.Default.prototype as L.Icon.Default & {
  _getIconUrl?: () => string;
};
delete DefaultIcon._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (severity: SeverityLevel) => {
  const color =
    severity === 'critical'
      ? '#ef4444'
      : severity === 'high'
        ? '#f97316'
        : severity === 'medium'
          ? '#eab308'
          : '#3b82f6';

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

function MapUpdater({ alerts }: { alerts: Alert[] }) {
  const map = useMap();

  useEffect(() => {
    if (alerts.length > 0) {
      const bounds = L.latLngBounds(
        alerts.map((alert) => [alert.latitude, alert.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [alerts, map]);

  return null;
}

export default function AttackMap() {
  const [alerts] = useState<Alert[]>(mockAlerts);

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attack Map</h1>
        <p className="text-muted-foreground">
          Geographic visualization of attack sources
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter((a) => a.severity === 'critical').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter((a) => a.severity === 'high').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Medium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter((a) => a.severity === 'medium').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Low</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter((a) => a.severity === 'low').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attack Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] rounded-lg overflow-hidden">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="/images/photo1764487074.jpg"
              />
              <MapUpdater alerts={alerts} />
              {alerts.map((alert) => (
                <Marker
                  key={alert.id}
                  position={[alert.latitude, alert.longitude]}
                  icon={createCustomIcon(alert.severity)}
                >
                  <Popup>
                    <div className="space-y-2 p-2">
                      <div className="font-bold">{alert.country}</div>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>IP:</strong> {alert.sourceIP}
                        </p>
                        <p>
                          <strong>Category:</strong> {alert.category}
                        </p>
                        <p className="text-xs">{alert.signature}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-red-500"></div>
              <span className="text-sm">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-orange-500"></div>
              <span className="text-sm">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-blue-500"></div>
              <span className="text-sm">Low</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}