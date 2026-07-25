export interface Candidate {
  id: number;
  name: string;
  years_exp: number;
  status: 'pending' | 'accepted' | 'rejected';
  date_applied: string;   // ISO datetime
  reviewed: boolean;
  description: string;
  created: string;
  updated: string;
}