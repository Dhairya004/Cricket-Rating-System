import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import logos from "@/public/logos_mapping.json";

export type TeamCategory = "ipl" | "mens" | "womens";

export type TeamRating = {
  logo: string;
  team: string;
  batting: number;
  bowling: number;
  fielding: number;
};

type TeamCategoryOption = {
  id: TeamCategory;
  label: string;
};

type RatingsState = {
  selectedCategory: TeamCategory;
  categories: TeamCategoryOption[];
  ratingsByCategory: Record<TeamCategory, TeamRating[]>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

type BackendRatingsResponse = Record<string, [number, number, number]>;

const RATINGS_API_URL =
  process.env.NEXT_PUBLIC_RATINGS_API_URL ?? "http://localhost:5000/api/ratings_per_match";

const iplTeamMetadata: Record<string, { logo: string; team: string }> = {
  CSK: { logo: logos["chennai_super_kings"], team: "Chennai Super Kings" },
  DC: { logo: logos["delhi_capitals"], team: "Delhi Capitals" },
  GT: { logo: logos["gujarat_titans"], team: "Gujarat Titans" },
  KKR: { logo: logos["kolkata_knight_riders"], team: "Kolkata Knight Riders" },
  LSG: { logo: logos["lucknow_super_giants"], team: "Lucknow Super Giants" },
  MI: { logo: logos["mumbai_indians"], team: "Mumbai Indians" },
  PBKS: { logo: logos["punjab_kings"], team: "Punjab Kings" },
  RCB: { logo: logos["royal_challengers_bangalore"], team: "Royal Challengers Bangalore" },
  RR: { logo: logos["rajasthan_royals"], team: "Rajasthan Royals" },
  SRH: { logo: logos["sunrisers_hyderabad"], team: "Sunrisers Hyderabad" },
};

const iplTeamOrder = ["MI", "CSK", "RCB", "PBKS", "KKR", "RR", "SRH", "DC", "LSG", "GT"];

function createTeamRating(teamCode: string, ratings: [number, number, number]): TeamRating {
  const metadata = iplTeamMetadata[teamCode] ?? { logo: "", team: teamCode };

  return {
    logo: metadata.logo,
    team: metadata.team,
    batting: ratings[0],
    bowling: ratings[1],
    fielding: ratings[2],
  };
}

function mapBackendRatingsToIplRows(ratings: BackendRatingsResponse): TeamRating[] {
  const knownTeams = iplTeamOrder
    .filter((teamCode) => ratings[teamCode])
    .map((teamCode) => createTeamRating(teamCode, ratings[teamCode]));

  const extraTeams = Object.entries(ratings)
    .filter(([teamCode]) => !iplTeamOrder.includes(teamCode))
    .map(([teamCode, teamRatings]) => createTeamRating(teamCode, teamRatings));

  return [...knownTeams, ...extraTeams];
}

export const fetchRatings = createAsyncThunk<TeamRating[]>(
  "ratings/fetchRatings",
  async () => {
    const response = await fetch(RATINGS_API_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch ratings: ${response.status} ${response.statusText}`);
    }

    const ratings = (await response.json()) as BackendRatingsResponse;
    return mapBackendRatingsToIplRows(ratings);
  },
);

const initialState: RatingsState = {
  selectedCategory: "ipl",
  categories: [
    { id: "ipl", label: "IPL Teams" },
    { id: "mens", label: "Men's National Teams" },
    { id: "womens", label: "Women's National Teams" },
  ],
  ratingsByCategory: {
    ipl: [],
    mens: [],
    womens: [],
  },
  status: "idle",
  error: null,
};

const ratingsSlice = createSlice({
  name: "ratings",
  initialState,
  reducers: {
    // Stores the active category so tabs and the ratings table stay in sync.
    setSelectedCategory(state, action: PayloadAction<TeamCategory>) {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRatings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ratingsByCategory.ipl = action.payload;
      })
      .addCase(fetchRatings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch ratings.";
      });
  },
});

export const { setSelectedCategory } = ratingsSlice.actions;
export default ratingsSlice.reducer;
