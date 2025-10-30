
import { ZoneData, WaterDataPoint } from '../types';

const DATA_POINTS = 60; // 60 minutes of data

// Generates a base flow rate based on the time of day
const getBaseFlow = (date: Date): number => {
  const hour = date.getHours();
  if (hour >= 6 && hour < 9) return 15 + Math.random() * 10; // Morning peak
  if (hour >= 18 && hour < 21) return 18 + Math.random() * 7; // Evening peak
  if (hour >= 0 && hour < 5) return 1 + Math.random(); // Overnight
  return 5 + Math.random() * 5; // Daytime off-peak
};

// Introduces random anomalies into the data
const introduceAnomaly = (
  data: WaterDataPoint[],
  zoneId: string,
  now: Date
): WaterDataPoint[] => {
  const anomalyType = Math.random();
  const anomalyStartTime = new Date(now.getTime() - Math.floor(Math.random() * DATA_POINTS) * 60000);

  if (anomalyType < 0.2 && (zoneId === 'zone-2' || zoneId === 'zone-4')) { // High severity leak
    return data.map(d => {
      if (new Date(d.timestamp) >= anomalyStartTime) {
        return { ...d, flowRate: d.flowRate + 40 + Math.random() * 15 };
      }
      return d;
    });
  } else if (anomalyType < 0.4 && (zoneId === 'zone-3' || zoneId === 'zone-6')) { // Medium severity leak (overnight)
     const hour = now.getHours();
     if(hour < 5 || hour > 23){
        return data.map(d => {
            if (new Date(d.timestamp) >= anomalyStartTime) {
                return { ...d, flowRate: 5 + Math.random() * 4 };
            }
            return d;
        });
     }
  }
  return data;
};

export const generateMockData = (zones: { id: string; name: string }[]): ZoneData[] => {
  const now = new Date();
  
  return zones.map(zone => {
    let data: WaterDataPoint[] = [];
    for (let i = DATA_POINTS - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000);
      const baseFlow = getBaseFlow(timestamp);
      const flowRate = baseFlow + (Math.random() - 0.5); // Add some noise
      data.push({
        timestamp: timestamp.toISOString(),
        flowRate: Math.max(0, flowRate), // Ensure flow rate is not negative
      });
    }

    // Randomly decide whether to introduce an anomaly for this zone
    if (Math.random() > 0.6) {
      data = introduceAnomaly(data, zone.id, now);
    }

    return {
      zoneId: zone.id,
      name: zone.name,
      data,
    };
  });
};
