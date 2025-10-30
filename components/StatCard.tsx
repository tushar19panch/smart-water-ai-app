
import React from 'react';
import { Stat } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard: React.FC<Stat> = ({ name, value, change, changeType }) => {
  const isIncrease = changeType === 'increase';
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{name}</p>
      <div className="mt-1 flex items-baseline">
        <p className="text-3xl font-bold text-brand-dark dark:text-white">{value}</p>
        {change && (
          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
            isIncrease ? 'text-red-500' : 'text-green-500'
          }`}>
            {isIncrease ? (
              <TrendingUp className="h-5 w-5 mr-1" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-5 w-5 mr-1" aria-hidden="true" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
