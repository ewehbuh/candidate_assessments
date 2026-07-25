import React from 'react';
import { Candidate } from '@/types/candidate';

interface StatusButtonProps {
  candidate: Candidate;
  onStatusChange: (id: number, status: 'accepted' | 'rejected') => void;
}

const StatusButton: React.FC<StatusButtonProps> = ({ candidate, onStatusChange }) => {
  const { id, status } = candidate;
  const isPending = status === 'pending';

  return (
    <div className="flex gap-2">
      <button
        onClick={() => onStatusChange(id, 'accepted')}
        disabled={!isPending}
        className={`px-3 py-1 rounded text-white transition ${
          isPending
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        Accept
      </button>
      <button
        onClick={() => onStatusChange(id, 'rejected')}
        disabled={!isPending}
        className={`px-3 py-1 rounded text-white transition ${
          isPending
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        Reject
      </button>
    </div>
  );
};

export default StatusButton;