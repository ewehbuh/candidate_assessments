'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCandidates, updateCandidateStatus, setSort } from '@/store/features/candidateSlice';
import CandidateList from '@/components/CandidateList';
import SortControls from '@/components/SortControls';
import AddCandidateForm from '@/components/AddCandidateForm';
import FilterControls from '@/components/FilterControls';

export default function Home() {
  const dispatch = useAppDispatch();
  const { items, loading, error, sortKey, sortOrder } = useAppSelector(
    (state) => state.candidates
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [rangeMin, setRangeMin] = useState<number | undefined>(undefined);
  const [rangeMax, setRangeMax] = useState<number | undefined>(undefined);

  useEffect(() => {
    dispatch(fetchCandidates({ sortKey, sortOrder, yearsExpMin: rangeMin, yearsExpMax: rangeMax }));
  }, [dispatch, sortKey, sortOrder, rangeMin, rangeMax]);

  const handleStatusChange = (id: number, status: 'accepted' | 'rejected') => {
    dispatch(updateCandidateStatus({ id, status }));
  };

  const handleSort = (key: typeof sortKey) => {
    const newOrder = (sortKey === key && sortOrder === 'asc') ? 'desc' : 'asc';
    dispatch(setSort({ key, order: newOrder }));
  };

  const handleFilter = (min: number | undefined, max: number | undefined) => {
    setRangeMin(min);
    setRangeMax(max);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        Loading candidates...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        Error loading candidates: {error}
      </div>
    );
  }

  const filterActive = rangeMin !== undefined || rangeMax !== undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Candidate List</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Add Candidate
          </button>
        </div>

        <FilterControls onFilter={handleFilter} />

        {filterActive && (
          <div className="text-sm text-gray-600 mb-2">
            Showing candidates with experience between {rangeMin ?? '0'} and {rangeMax ?? '∞'} years.
            <button
              onClick={() => handleFilter(undefined, undefined)}
              className="text-blue-600 ml-2 underline"
            >
              Clear
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">
              {filterActive ? 'No candidates match the selected experience range.' : 'No candidates found.'}
            </p>
            {!filterActive && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Your First Candidate
              </button>
            )}
          </div>
        ) : (
          <>
            <SortControls onSort={handleSort} currentKey={sortKey} currentOrder={sortOrder} />
            <CandidateList candidates={items} onStatusChange={handleStatusChange} />
          </>
        )}

        {showAddForm && <AddCandidateForm onClose={() => setShowAddForm(false)} />}
      </div>
    </div>
  );
}