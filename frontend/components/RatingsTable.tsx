'use client';

import Table from '@mui/joy/Table';
// Use native <img> for small public icons to avoid Next/Image optimization issues
import { useAppSelector } from '@/store/hooks';

export default function TableAlignment() {
  const selectedCategory = useAppSelector((state) => state.ratings.selectedCategory);
  const rows = useAppSelector((state) => state.ratings.ratingsByCategory[selectedCategory]);
  const status = useAppSelector((state) => state.ratings.status);
  const error = useAppSelector((state) => state.ratings.error);

  if (selectedCategory === 'ipl' && status === 'loading') {
    return <p className="p-4 text-sm text-zinc-600 dark:text-zinc-300">Loading ratings...</p>;
  }

  if (selectedCategory === 'ipl' && status === 'failed') {
    return (
      <p className="p-4 text-sm text-red-600 dark:text-red-300">
        {error ?? 'Unable to load ratings.'}
      </p>
    );
  }

  // Shows a clear empty state for categories whose ratings have not been added yet.
  if (rows.length === 0) {
    return <p className="p-4 text-sm text-zinc-600 dark:text-zinc-300">No ratings available yet.</p>;
  }

  return (
    <Table sx={{ '& tr > *:not(:first-child)': { textAlign: 'right' } }}>
      <thead>
        <tr>
          <th style={{ width: '40%' }}>Team</th>
          <th>Batting</th>
          <th>Bowling</th>
          <th>Fielding</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.team}>
            <td><img src={row.logo} alt={row.team} width={16} height={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> <strong>{row.team}</strong></td>
            <td><strong>{row.batting}</strong></td>
            <td><strong>{row.bowling}</strong></td>
            <td><strong>{row.fielding}</strong></td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
