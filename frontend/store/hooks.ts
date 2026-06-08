import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, AppStore, RootState } from "./store";

// Gives components a correctly typed dispatch function for Redux actions.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// Gives components typed access to Redux state selectors.
export const useAppSelector = useSelector.withTypes<RootState>();

// Gives advanced callers typed access to the store instance when needed.
export const useAppStore = useStore.withTypes<AppStore>();
