'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { fetchRatings } from '@/store/ratingsSlice';
import { makeStore } from '@/store/store';

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
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
