import React from 'react';

type SortKey = 'status' | 'date_applied' | 'years_exp';

interface SortControlsProps {
  onSort: (key: SortKey) => void;
  currentKey: SortKey;
  currentOrder: 'asc' | 'desc';
}

const SortControls: React.FC<SortControlsProps> = ({ onSort, currentKey, currentOrder }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white rounded shadow">
      <button
        onClick={() => onSort('status')}
        className={`px-4 py-2 rounded transition ${
          currentKey === 'status'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
      >
        Sort by Status {currentKey === 'status' && (currentOrder === 'asc' ? '↑' : '↓')}
      </button>
      <button
        onClick={() => onSort('date_applied')}
        className={`px-4 py-2 rounded transition ${
          currentKey === 'date_applied'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
      >
        Sort by Date {currentKey === 'date_applied' && (currentOrder === 'asc' ? '↑' : '↓')}
      </button>
      <button
        onClick={() => onSort('years_exp')}
        className={`px-4 py-2 rounded transition ${
          currentKey === 'years_exp'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
      >
        Sort by Experience {currentKey === 'years_exp' && (currentOrder === 'asc' ? '↑' : '↓')}
      </button>
    </div>
  );
};

export default SortControls;