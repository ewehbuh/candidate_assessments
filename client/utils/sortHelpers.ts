import { Candidate } from '@/types/candidate';

type SortKey = keyof Pick<Candidate, 'status' | 'date_applied'>;

export const sortCandidates = (
  candidates: Candidate[],
  key: SortKey,
  order: 'asc' | 'desc'
): Candidate[] => {
  const sorted = [...candidates];
  sorted.sort((a, b) => {
    let valA: string | number | Date = a[key];
    let valB: string | number | Date = b[key];

    if (key === 'date_applied') {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
};