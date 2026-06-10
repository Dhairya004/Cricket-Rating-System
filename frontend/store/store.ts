import { configureStore } from '@reduxjs/toolkit';
import ratingsReducer from './ratingsSlice';

export function makeStore() {
  return configureStore({
    reducer: {
      ratings: ratingsReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
