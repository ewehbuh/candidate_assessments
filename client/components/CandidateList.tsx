import React from 'react';
import { Candidate } from '@/types/candidate';
import CandidateRow from './CandidateRow';

interface CandidateListProps {
  candidates: Candidate[];
  onStatusChange: (id: number, status: 'accepted' | 'rejected') => void;
}

const CandidateList: React.FC<CandidateListProps> = ({ candidates, onStatusChange }) => {
  if (candidates.length === 0) {
    return <div className="text-center py-10 text-gray-500">No candidates available.</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left text-sm font-semibold text-gray-700">Name</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-700">Years Exp.</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-700">Date Applied</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-700">Reviewed</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-700">Description</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {candidates.map((candidate) => (
            <CandidateRow
              key={candidate.id}
              candidate={candidate}
              onStatusChange={onStatusChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateList;