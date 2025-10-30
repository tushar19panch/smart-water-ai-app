import React, { useState, useEffect, useCallback } from 'react';
import { ZONES } from '../constants';
import { generateMockData } from '../services/mockDataService';
import { analyzeWaterData, forecastWaterDemand } from '../services/geminiService';
import { Alert as AlertType, ZoneData, Stat, WaterDataPoint } from '../types';
import StatCard from './StatCard';
import ConsumptionChart from './ConsumptionChart';
import ZoneMap from './ZoneMap';
import AlertsPanel from './AlertsPanel';
import ForecastPanel from './ForecastPanel';
import { Loader, Droplets, Siren, AreaChart } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [zoneData, setZoneData] = useState<ZoneData[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [forecast, setForecast] = useState<WaterDataPoint[] | null>(null);
  const [forecastSummary, setForecastSummary] = useState<string | null>(null);
  const [isForecasting, setIsForecasting] = useState(false);

  const fetchDataAndAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mockData = generateMockData(ZONES);
      setZoneData(mockData);
      
      const analysisResult = await analyzeWaterData(mockData);
      setAlerts(analysisResult.alerts);
      setLastUpdated(new Date());

      if (!selectedZone) {
        const zoneWithAlert = analysisResult.alerts.length > 0
          ? mockData.find(z => z.zoneId === analysisResult.alerts[0].zoneId)
          : null;
        
        if (zoneWithAlert) {
          setSelectedZone(zoneWithAlert);
        } else if(mockData.length > 0){
          const zoneWithMaxFlow = mockData.reduce((prev, current) => {
              const prevFlow = prev.data[prev.data.length - 1]?.flowRate || 0;
              const currentFlow = current.data[current.data.length - 1]?.flowRate || 0;
              return (prevFlow > currentFlow) ? prev : current
          });
          setSelectedZone(zoneWithMaxFlow);
        }
      }

    } catch (err) {
      console.error("Error fetching or analyzing data:", err);
      setError("Failed to analyze water data. Please check your connection or API key.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedZone]);

  useEffect(() => {
    fetchDataAndAnalyze();
    const interval = setInterval(fetchDataAndAnalyze, 60000);
    return () => clearInterval(interval);
  }, [fetchDataAndAnalyze]);

  useEffect(() => {
    const getForecast = async () => {
      if (!selectedZone) {
        setForecast(null);
        setForecastSummary(null);
        return;
      }

      setIsForecasting(true);
      try {
        const result = await forecastWaterDemand(selectedZone);
        setForecast(result.forecast);
        setForecastSummary(result.summary);
      } catch (err) {
        console.error("Error fetching forecast:", err);
        setForecastSummary("Could not generate forecast.");
        setForecast(null);
      } finally {
        setIsForecasting(false);
      }
    };

    getForecast();
  }, [selectedZone]);

  const totalConsumption = zoneData
    .flatMap(z => z.data)
    .reduce((sum, d) => sum + d.flowRate, 0);

  const stats: Stat[] = [
    { name: 'Total Consumption', value: `${(totalConsumption / 1000).toFixed(2)} kL/min`, change: '+2.5%', changeType: 'increase' },
    { name: 'Active Alerts', value: alerts.length.toString(), change: alerts.length > 3 ? 'High' : 'Normal', changeType: alerts.length > 3 ? 'increase' : 'decrease' },
    { name: 'Avg. Pressure', value: '52 PSI', change: '-0.2%', changeType: 'decrease' },
    { name: 'System Efficiency', value: '96.8%', change: '+0.1%', changeType: 'decrease' }
  ];

  if (isLoading && !zoneData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-brand-primary">
        <Loader className="animate-spin h-12 w-12 mb-4" />
        <p className="text-xl font-semibold">Initializing Smart Water Grid...</p>
        <p className="text-gray-500">Analyzing real-time sensor data with Gemini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => <StatCard key={stat.name} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200 flex items-center">
            <AreaChart className="w-6 h-6 mr-2 text-brand-secondary"/>
            Consumption Trend for {selectedZone?.name || 'All Zones'}
          </h3>
          <ConsumptionChart data={selectedZone ? selectedZone.data : []} forecastData={forecast} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200 flex items-center">
            <Droplets className="w-6 h-6 mr-2 text-brand-secondary"/>
            City Zones Overview
          </h3>
          <ZoneMap zones={zoneData} alerts={alerts} selectedZoneId={selectedZone?.zoneId} onZoneSelect={id => setSelectedZone(zoneData.find(z => z.zoneId === id) || null)} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200 flex items-center">
            <Siren className="w-6 h-6 mr-2 text-brand-secondary"/>
            Real-time Alerts
          </h3>
          <AlertsPanel alerts={alerts} isLoading={isLoading} lastUpdated={lastUpdated} />
        </div>
        <ForecastPanel summary={forecastSummary} isLoading={isForecasting} />
      </div>
    </div>
  );
};

export default Dashboard;
