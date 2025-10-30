
import React from 'react';
import { Alert, Severity } from '../types';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
  isLoading: boolean;
  lastUpdated: Date | null;
}

const severityConfig: Record<Severity, { icon: React.ReactNode, classes: string, name: string }> = {
  High: {
    icon: <AlertTriangle className="h-5 w-5 text-white" />,
    classes: 'bg-alert-high',
    name: 'High Severity'
  },
  Medium: {
    icon: <AlertTriangle className="h-5 w-5 text-black" />,
    classes: 'bg-alert-medium',
    name: 'Medium Severity'
  },
  Low: {
    icon: <AlertTriangle className="h-5 w-5 text-black" />,
    classes: 'bg-alert-low',
    name: 'Low Severity'
  },
};

const AlertItem: React.FC<{ alert: Alert }> = ({ alert }) => {
  const config = severityConfig[alert.severity];
  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.classes}`}>
        {config.icon}
      </div>
      <div>
        <p className="font-semibold text-gray-800 dark:text-gray-100">
          {config.name} in <span className="text-brand-primary dark:text-brand-secondary">{alert.zoneName}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{alert.reason}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {new Date(alert.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};


const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, isLoading, lastUpdated }) => {
  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <span>AI-powered anomaly detection by Gemini</span>
        <span>Last updated: {isLoading ? 'Updating...' : lastUpdated?.toLocaleTimeString() || 'N/A'}</span>
      </div>
      <div className="max-h-96 overflow-y-auto pr-2 -mr-2 divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading && alerts.length === 0 && <p className="text-center py-8">Analyzing data...</p>}
        {!isLoading && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-8 text-green-600 dark:text-green-400">
            <ShieldCheck className="w-16 h-16 mb-4" />
            <p className="font-semibold text-lg">All Systems Normal</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">No anomalies detected in the water grid.</p>
          </div>
        )}
        {alerts.map((alert, index) => (
          <AlertItem key={`${alert.zoneId}-${alert.timestamp}-${index}`} alert={alert} />
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
