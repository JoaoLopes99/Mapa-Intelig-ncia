import React from 'react';
import CriminalBoard from '../CriminalBoard';

const CriminalBoardModule: React.FC = () => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quadro Criminal</h1>
            <p className="text-sm text-gray-600">Visualização de conexões entre pessoas</p>
          </div>
        </div>
        <div className="h-[800px] border border-gray-200 rounded-lg">
          <CriminalBoard />
        </div>
      </div>
    </div>
  );
};

export default CriminalBoardModule; 