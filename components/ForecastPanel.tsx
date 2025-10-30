import React from 'react';
import { BrainCircuit, Loader } from 'lucide-react';

interface ForecastPanelProps {
  summary: string | null;
  isLoading: boolean;
}

const ForecastPanel: React.FC<ForecastPanelProps> = ({ summary, isLoading }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200 flex items-center flex-shrink-0">
        <BrainCircuit className="w-6 h-6 mr-2 text-brand-secondary"/>
        AI-Powered Forecast
      </h3>
      <div className="flex-grow flex flex-col justify-center text-center">
        {isLoading && (
          <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
            <Loader className="animate-spin h-5 w-5 mr-3" />
            <span>Generating forecast with Gemini...</span>
          </div>
        )}
        {!isLoading && !summary && (
          <p className="text-gray-500 dark:text-gray-400">Select a zone to view its demand forecast.</p>
        )}
        {!isLoading && summary && (
          <div className="text-left">
            <p className="text-gray-700 dark:text-gray-300 italic">"{summary}"</p>
            <p className="text-right text-xs text-gray-400 dark:text-gray-500 mt-4">- Gemini Predictive Engine</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastPanel;
