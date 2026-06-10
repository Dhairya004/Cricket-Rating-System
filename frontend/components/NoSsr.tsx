"use client";

import { useSyncExternalStore, type ReactNode } from 'react';

type Props = { children: ReactNode };
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function NoSsr({ children }: Props) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) return null;
  return <>{children}</>;
}
