'use client';

import React, { useState } from 'react';

interface FilterControlsProps {
  onFilter: (min: number | undefined, max: number | undefined) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ onFilter }) => {
  const [min, setMin] = useState<string>('');
  const [max, setMax] = useState<string>('');

  const handleApply = () => {
    const minVal = min ? parseInt(min, 10) : undefined;
    const maxVal = max ? parseInt(max, 10) : undefined;
    if (minVal !== undefined && maxVal !== undefined && minVal > maxVal) {
      alert('Minimum years cannot be greater than maximum.');
      return;
    }
    onFilter(minVal, maxVal);
  };

  const handleClear = () => {
    setMin('');
    setMax('');
    onFilter(undefined, undefined);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-white rounded shadow">
      <span className="font-medium text-gray-700">Experience (years):</span>
      <input
        type="number"
        placeholder="Min"
        value={min}
        onChange={(e) => setMin(e.target.value)}
        className="w-20 border border-gray-300 rounded-md p-1 text-center"
        min="0"
      />
      <span className="text-gray-500">to</span>
      <input
        type="number"
        placeholder="Max"
        value={max}
        onChange={(e) => setMax(e.target.value)}
        className="w-20 border border-gray-300 rounded-md p-1 text-center"
        min="0"
      />
      <button
        onClick={handleApply}
        className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Apply
      </button>
      <button
        onClick={handleClear}
        className="px-4 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        Clear
      </button>
    </div>
  );
};

export default FilterControls;