"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store/store";
import { fetchRatings } from "@/store/ratingsSlice";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  // Lazily creates one store instance and preserves it for this provider's lifetime.
  const [store] = useState(makeStore);
  const hasFetchedRatings = useRef(false);

  useEffect(() => {
    if (hasFetchedRatings.current) {
      return;
    }

    hasFetchedRatings.current = true;
    void store.dispatch(fetchRatings());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
