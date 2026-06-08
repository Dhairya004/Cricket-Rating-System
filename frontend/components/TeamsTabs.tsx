'use client';

import type { SyntheticEvent } from 'react';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import { setSelectedCategory, type TeamCategory } from '@/store/ratingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function TabDisabled() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.ratings.categories);
  const selectedCategory = useAppSelector((state) => state.ratings.selectedCategory);

  // Dispatches tab changes only when Joy UI supplies a known category value.
  function handleCategoryChange(
    _event: SyntheticEvent | null,
    value: string | number | null,
  ) {
    if (typeof value === 'string' && categories.some((category) => category.id === value)) {
      dispatch(setSelectedCategory(value as TeamCategory));
    }
  }

  return (
    <Tabs
        aria-label="Outlined tabs"
        value={selectedCategory}
        onChange={handleCategoryChange}
      >
        <TabList variant="outlined" disableUnderline>
          {categories.map((category) => (
            <Tab
              key={category.id}
              value={category.id}
              variant={selectedCategory === category.id ? 'soft' : 'plain'}
              color={selectedCategory === category.id ? 'success' : 'neutral'}
            >
              {category.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>

  );
}
