import React from 'react';
import { Candidate } from '@/types/candidate';
import StatusButton from './StatusButton';

interface CandidateRowProps {
  candidate: Candidate;
  onStatusChange: (id: number, status: 'accepted' | 'rejected') => void;
}

const CandidateRow: React.FC<CandidateRowProps> = ({ candidate, onStatusChange }) => {
  const { name, years_exp, status, date_applied, reviewed, description } = candidate;

  const statusColors: Record<Candidate['status'], string> = {
    pending: 'bg-yellow-500',
    accepted: 'bg-green-600',
    rejected: 'bg-red-600',
  };

  return (
    <tr className="border-b hover:bg-gray-50 transition">
      <td className="p-3 font-medium">{name}</td>
      <td className="p-3">{years_exp}</td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded text-white text-sm ${statusColors[status]}`}>
          {status}
        </span>
      </td>
      <td className="p-3">{new Date(date_applied).toLocaleDateString()}</td>
      <td className="p-3">{reviewed ? '✅' : '⏳'}</td>
      <td className="p-3 max-w-xs truncate" title={description}>
        {description}
      </td>
      <td className="p-3">
        <StatusButton candidate={candidate} onStatusChange={onStatusChange} />
      </td>
    </tr>
  );
};

export default CandidateRow;