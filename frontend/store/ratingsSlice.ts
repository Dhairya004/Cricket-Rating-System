import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type TeamCategory = 'IPL' | 'MensT20' | 'WomensT20';
export type RatingValues = [number, number, number, number];
export type Ratings = Partial<Record<TeamCategory, Record<string, RatingValues>>>;

export type RatingCategoryOption = {
  id: TeamCategory;
  label: string;
};

type RatingsState = {
  categories: RatingCategoryOption[];
  selectedCategory: TeamCategory;
  ratings: Ratings;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: RatingsState = {
  categories: [
    { id: 'IPL', label: 'IPL' },
    { id: 'MensT20', label: 'Mens T20' },
    { id: 'WomensT20', label: 'Womens T20' },
  ],
  selectedCategory: 'IPL',
  ratings: {},
  status: 'idle',
  error: null,
};

export const fetchRatings = createAsyncThunk<Ratings>(
  'ratings/fetchRatings',
  async () => {
    const response = await fetch('http://127.0.0.1:5000/api/ratings_per_match');

    if (!response.ok) {
      throw new Error('Unable to load ratings.');
    }

    return response.json() as Promise<Ratings>;
  },
);

const ratingsSlice = createSlice({
  name: 'ratings',
  initialState,
  reducers: {
    setSelectedCategory(state, action: PayloadAction<TeamCategory>) {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRatings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.ratings = action.payload;
      })
      .addCase(fetchRatings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to load ratings.';
      });
  },
});

export const { setSelectedCategory } = ratingsSlice.actions;
export default ratingsSlice.reducer;
