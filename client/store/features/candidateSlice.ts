import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { Candidate } from '@/types/candidate';

// ----- Types -----
type SortKey = 'status' | 'date_applied' | 'years_exp';

// ----- Async Thunks -----

// Fetch candidates with sorting and optional range filtering
export const fetchCandidates = createAsyncThunk<
  Candidate[],
  {
    sortKey: SortKey;
    sortOrder: 'asc' | 'desc';
    yearsExpMin?: number;
    yearsExpMax?: number;
  } | undefined
>(
  'candidates/fetchCandidates',
  async (params) => {
    const queryParams: Record<string, string> = {};
    if (params) {
      const direction = params.sortOrder === 'asc' ? '' : '-';
      queryParams.ordering = `${direction}${params.sortKey}`;
      if (params.yearsExpMin !== undefined) {
        queryParams.years_exp_min = String(params.yearsExpMin);
      }
      if (params.yearsExpMax !== undefined) {
        queryParams.years_exp_max = String(params.yearsExpMax);
      }
    }
    const response = await api.get<Candidate[]>('/candidates/', { params: queryParams });
    return response.data;
  }
);

// Update candidate status
export const updateCandidateStatus = createAsyncThunk<
  Candidate,
  { id: number; status: 'accepted' | 'rejected' }
>(
  'candidates/updateCandidateStatus',
  async ({ id, status }) => {
    const response = await api.patch<Candidate>(`/candidates/${id}/`, { status });
    return response.data;
  }
);

// Add a new candidate
export const addCandidate = createAsyncThunk<
  Candidate,
  Omit<Candidate, 'id' | 'created' | 'updated'>
>(
  'candidates/addCandidate',
  async (newCandidate) => {
    const response = await api.post<Candidate>('/candidates/', newCandidate);
    return response.data;
  }
);

// ----- Slice State -----
interface CandidatesState {
  items: Candidate[];
  loading: boolean;
  error: string | null;
  sortKey: SortKey;
  sortOrder: 'asc' | 'desc';
}

const initialState: CandidatesState = {
  items: [],
  loading: false,
  error: null,
  sortKey: 'date_applied',
  sortOrder: 'asc',
};

// ----- Slice -----
const candidateSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    setSort: (state, action: PayloadAction<{ key: SortKey; order?: 'asc' | 'desc' }>) => {
      state.sortKey = action.payload.key;
      state.sortOrder = action.payload.order || 'asc';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch candidates
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch candidates';
      })
      // Update status
      .addCase(updateCandidateStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex((c) => c.id === updated.id);
        if (index !== -1) {
          state.items[index] = updated;
        }
      })
      // Add candidate
      .addCase(addCandidate.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export const { setSort } = candidateSlice.actions;
export default candidateSlice.reducer;