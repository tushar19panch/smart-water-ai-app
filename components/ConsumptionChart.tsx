import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WaterDataPoint } from '../types';

interface ConsumptionChartProps {
  data: WaterDataPoint[];
  forecastData?: WaterDataPoint[] | null;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const point = payload.find(p => p.value !== undefined && p.value !== null);
    if (!point) return null;
    
    const type = point.dataKey === 'forecastFlowRate' ? 'Forecasted' : 'Actual';
    const value = point.value;

    return (
      <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm p-2 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
        <p className="label font-bold text-gray-700 dark:text-gray-200">{`Time: ${label}`}</p>
        <p className="intro" style={{color: point.stroke}}>{`${type} Flow Rate: ${value.toFixed(2)} L/min`}</p>
      </div>
    );
  }
  return null;
};

const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ data, forecastData }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-80 text-gray-500">Select a zone to view data.</div>
  }

  const formattedActualData = data.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: new Date(d.timestamp).getTime(),
    actualFlowRate: d.flowRate,
  }));

  let combinedData: any[] = [...formattedActualData];

  if (forecastData && forecastData.length > 0) {
    const lastActualPoint = data[data.length - 1];

    const connectionPoint = {
        time: new Date(lastActualPoint.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date(lastActualPoint.timestamp).getTime(),
        forecastFlowRate: lastActualPoint.flowRate,
    };

    const formattedForecastData = forecastData.map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date(d.timestamp).getTime(),
        forecastFlowRate: d.flowRate,
    }));
    
    const dataMap = new Map(combinedData.map(p => [p.timestamp, p]));

    [connectionPoint, ...formattedForecastData].forEach(p => {
        const existing = dataMap.get(p.timestamp) || { timestamp: p.timestamp, time: p.time };
        dataMap.set(p.timestamp, { ...existing, ...p });
    });

    combinedData = Array.from(dataMap.values());
  }
  
  combinedData.sort((a,b) => a.timestamp - b.timestamp);

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <LineChart data={combinedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
          <XAxis dataKey="time" stroke="rgb(156 163 175)" />
          <YAxis stroke="rgb(156 163 175)" label={{ value: 'L/min', angle: -90, position: 'insideLeft', fill: 'rgb(107 114 128)' }}/>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="actualFlowRate" 
            name="Actual Flow"
            stroke="#00A8E8" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 8, stroke: '#00529B', strokeWidth: 2 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="forecastFlowRate"
            name="Forecasted Flow"
            stroke="#82d8f7"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConsumptionChart;
