'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addCandidate } from '@/store/features/candidateSlice';

interface AddCandidateFormProps {
  onClose: () => void;
}

const AddCandidateForm: React.FC<AddCandidateFormProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [yearsExp, setYearsExp] = useState<number | ''>('');
  const [dateApplied, setDateApplied] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client‑side validation
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (yearsExp === '' || yearsExp < 0) {
      setError('Years of experience must be a non‑negative number.');
      return;
    }
    if (!dateApplied) {
      setError('Date applied is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    setLoading(true);
    try {
      // Dispatch the thunk and unwrap to catch rejection errors
      await dispatch(
        addCandidate({
          name: name.trim(),
          years_exp: Number(yearsExp),
          date_applied: new Date(dateApplied).toISOString(),
          description: description.trim(),
          status: 'pending', // new candidates always start as pending
          reviewed: false,
        })
      ).unwrap();
      onClose(); // close modal on success
    } catch (err: any) {
      // Extract meaningful error message
      let errorMsg = 'Failed to add candidate. Please try again.';
      if (err.response?.data) {
        // Django REST Framework validation errors
        const data = err.response.data;
        if (typeof data === 'object') {
          const messages = Object.values(data).flat().join(' ');
          if (messages) errorMsg = messages;
        } else if (typeof data === 'string') {
          errorMsg = data;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Add New Candidate</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 whitespace-pre-wrap">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">Years of Experience *</label>
            <input
              type="number"
              min="0"
              step="1"
              value={yearsExp}
              onChange={(e) => setYearsExp(e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">Date Applied *</label>
            <input
              type="date"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidateForm;