
import React from 'react';
import { Droplet } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Droplet className="h-10 w-10 text-brand-secondary" />
            <h1 className="ml-3 text-2xl font-bold text-brand-dark dark:text-brand-light">
              Aqua-Sight <span className="font-light text-gray-500 dark:text-gray-400">| Smart Water Management</span>
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
