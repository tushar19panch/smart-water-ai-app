import { GoogleGenAI, Type } from "@google/genai";
import { ZoneData, AnalysisResult, Alert, ForecastResult, WaterDataPoint } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const alertSchema = {
    type: Type.OBJECT,
    properties: {
        zoneId: { type: Type.STRING },
        zoneName: { type: Type.STRING },
        timestamp: { type: Type.STRING, description: "The ISO 8601 timestamp of the detected anomaly." },
        severity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
        reason: { type: Type.STRING, description: "A brief explanation of why this is considered an anomaly." },
    },
    required: ["zoneId", "zoneName", "timestamp", "severity", "reason"],
};

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    alerts: {
      type: Type.ARRAY,
      items: alertSchema,
    },
    summary: {
      type: Type.STRING,
      description: "A brief one-sentence summary of the overall system status."
    }
  },
  required: ['alerts', 'summary'],
};


export async function analyzeWaterData(zoneData: ZoneData[]): Promise<AnalysisResult> {
  const model = "gemini-2.5-flash";

  const prompt = `
    You are an AI expert in analyzing IoT sensor data for urban water management systems.
    Your task is to detect anomalies like pipe leaks or bursts from time-series water flow data.

    Here are the normal operating parameters:
    - Peak hours (6 AM - 9 AM, 6 PM - 9 PM): Normal flow is between 5-25 L/min per zone.
    - Off-peak hours (daytime): Normal flow is 2-10 L/min.
    - Overnight (12 AM - 5 AM): Normal flow is under 2 L/min. A sustained flow above 3 L/min is a strong indicator of a leak.

    Analyze the following JSON data which contains water flow rates (in Liters per minute) for several city zones.
    Identify any data points that suggest a water leak or pipe burst based on these rules:
    - HIGH severity: A sudden, sharp spike above 50 L/min, or a sustained overnight flow above 10 L/min.
    - MEDIUM severity: A sustained flow between 3-10 L/min overnight, or an unusual spike during off-peak hours.
    - LOW severity: Slightly elevated but consistent flow that deviates from the historical norm for that time.

    Return your analysis in the specified JSON format. If no anomalies are found, return an empty array for "alerts".

    Sensor Data:
    ${JSON.stringify(zoneData, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const text = response.text.trim();
    const result: AnalysisResult = JSON.parse(text);
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Return a structured error response
    return {
      alerts: [{
        zoneId: 'system',
        zoneName: 'System',
        timestamp: new Date().toISOString(),
        severity: 'High',
        reason: 'Failed to connect to AI analysis service. Check API key and network.',
      }],
      summary: 'Error in AI analysis.'
    };
  }
}

const forecastSchema = {
  type: Type.OBJECT,
  properties: {
    forecast: {
      type: Type.ARRAY,
      description: "An array of 6 data points representing the hourly forecast for the next 6 hours.",
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.STRING, description: "The ISO 8601 timestamp for the forecast hour." },
          flowRate: { type: Type.NUMBER, description: "The predicted flow rate in Liters per minute." }
        },
        required: ["timestamp", "flowRate"],
      },
    },
    summary: {
      type: Type.STRING,
      description: "A brief, actionable summary of the forecast (e.g., 'Expect a sharp increase in demand around 6 PM')."
    }
  },
  required: ['forecast', 'summary'],
};

export async function forecastWaterDemand(zone: ZoneData): Promise<ForecastResult> {
  const model = "gemini-2.5-flash";
  const lastTimestamp = zone.data[zone.data.length - 1].timestamp;

  const prompt = `
    You are an AI expert in time-series forecasting for urban water management systems.
    Your task is to predict water demand for a specific city zone based on its recent history.

    Here are the typical daily patterns:
    - Peak hours (6 AM - 9 AM, 6 PM - 9 PM): High consumption.
    - Off-peak hours (daytime): Moderate consumption.
    - Overnight (12 AM - 5 AM): Very low consumption.

    Based on the provided historical data for "${zone.name}", forecast the water flow rate (in Liters per minute) for the next 6 hours, providing one data point per hour. The last known data point is at ${lastTimestamp}.

    Return your forecast in the specified JSON format. The summary should be a concise, human-readable insight about the upcoming trend.

    Historical Sensor Data for ${zone.name}:
    ${JSON.stringify(zone.data.slice(-20), null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: forecastSchema,
      },
    });

    const text = response.text.trim();
    const result: ForecastResult = JSON.parse(text);
    return result;

  } catch (error) {
    console.error("Error calling Gemini API for forecast:", error);
    return {
      forecast: [],
      summary: 'Failed to generate forecast due to an API error.',
    };
  }
}
