import { configureStore } from "@reduxjs/toolkit";
import ratingsReducer from "./ratingsSlice";

// Builds the single Redux store used by the client-side provider.
export function makeStore() {
  return configureStore({
    reducer: {
      ratings: ratingsReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
