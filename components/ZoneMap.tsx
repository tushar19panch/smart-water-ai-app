
import React from 'react';
import { Alert, ZoneData, Severity } from '../types';

interface ZoneMapProps {
  zones: ZoneData[];
  alerts: Alert[];
  selectedZoneId?: string | null;
  onZoneSelect: (zoneId: string) => void;
}

const getZoneStatus = (zoneId: string, alerts: Alert[]): Severity | 'Normal' => {
  const zoneAlerts = alerts.filter(a => a.zoneId === zoneId);
  if (zoneAlerts.length === 0) return 'Normal';
  if (zoneAlerts.some(a => a.severity === 'High')) return 'High';
  if (zoneAlerts.some(a => a.severity === 'Medium')) return 'Medium';
  return 'Low';
};

const statusClasses: Record<Severity | 'Normal', string> = {
  High: 'bg-alert-high/80 border-alert-high animate-pulse',
  Medium: 'bg-alert-medium/80 border-alert-medium',
  Low: 'bg-alert-low/80 border-alert-low',
  Normal: 'bg-green-500/80 border-green-700',
};

const selectedClasses = 'ring-4 ring-brand-secondary ring-offset-2 ring-offset-white dark:ring-offset-gray-800';

const ZoneMap: React.FC<ZoneMapProps> = ({ zones, alerts, selectedZoneId, onZoneSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
      {zones.map(zone => {
        const status = getZoneStatus(zone.zoneId, alerts);
        const isSelected = zone.zoneId === selectedZoneId;
        return (
          <button
            key={zone.zoneId}
            onClick={() => onZoneSelect(zone.zoneId)}
            className={`flex items-center justify-center p-4 text-center text-white font-semibold rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${statusClasses[status]} ${isSelected ? selectedClasses : ''}`}
            style={{minHeight: '80px'}}
          >
            {zone.name}
          </button>
        );
      })}
    </div>
  );
};

export default ZoneMap;
