'use client';

import Table from '@mui/joy/Table';
import { useAppSelector } from '@/store/hooks';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';
// Use native <img> for small public icons to avoid Next/Image optimization issues

const logoByTeam: Record<string, string> = {
  CSK: '/logos/ipl/chennai_super_kings.svg',
  DC: '/logos/ipl/delhi_capitals.png',
  GT: '/logos/ipl/gujarat_titans.png',
  KKR: '/logos/ipl/kolkata_knight_riders.svg',
  LSG: '/logos/ipl/lucknow_supergiants.svg',
  MI: '/logos/ipl/mumbai_indians.svg',
  PBKS: '/logos/ipl/punjab_kings.svg',
  RCB: '/logos/ipl/royal_challengers_bangalore.svg',
  RR: '/logos/ipl/rajasthan_royals.jpg',
  SRH: '/logos/ipl/sunrisers_hyderabad.svg',
  Afghanistan: '/logos/international/afghanistan.png',
  Australia: '/logos/international/australia.png',
  Bangladesh: '/logos/international/bangladesh.png',
  England: '/logos/international/england.svg',
  India: '/logos/international/india.svg',
  'New Zealand': '/logos/international/new_zealand.png',
  Pakistan: '/logos/international/pakistan.svg',
  'South Africa': '/logos/international/south_africa.svg',
  'Sri Lanka': '/logos/international/sri_lanka.png',
  'West Indies': '/logos/international/west_indies.svg',
};

function renderStars(rating: number) {
  if (rating >= 80) {
    return <><StarIcon sx={{ color: 'green' }} /><StarIcon sx={{ color: 'green' }} /><StarIcon sx={{ color: 'green' }} /><StarIcon sx={{ color: 'green' }} /><StarIcon sx={{ color: 'green' }} /></>;
  } else if (rating >= 77.5 && rating < 80) {
    return <><StarIcon sx={{ color: 'green' }} /><StarIcon sx={{ color: 'green' }} /><StarIcon sx={{ color: 'green' }} /><StarIcon sx={{ color: 'green' }} /><StarHalfIcon sx={{ color: 'green' }} /></>;
  } else if (rating >= 75 && rating < 77.5) {
    return <><StarIcon sx={{ color: 'green' }} /><StarIcon sx={{ color: 'green' }} /><StarIcon sx={{ color: 'green' }} /><StarIcon sx={{ color: 'green' }} /><StarBorderIcon sx={{ color: 'green' }} /></>;
  }
}

export default function TableAlignment() {
  const ratings = useAppSelector((state) => state.ratings.ratings);
  const selectedCategory = useAppSelector((state) => state.ratings.selectedCategory);
  const status = useAppSelector((state) => state.ratings.status);
  const error = useAppSelector((state) => state.ratings.error);
  const rows = Object.entries(ratings[selectedCategory] ?? {}).map(([team, values]) => ({
    team,
    logo: logoByTeam[team],
    batting: values[0],
    bowling: values[1],
    fielding: values[2],
    ovr_rating: values[3],
  }));
  rows.sort((a, b) => b.ovr_rating - a.ovr_rating);

  if (status === 'loading') {
    return <p className="p-4 text-sm text-zinc-600 dark:text-zinc-300">Loading ratings...</p>;
  }

  if (status === 'failed') {
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
    <Table sx={{ '& tr > *:not(:first-of-type)': { textAlign: 'right' } }}>
      <thead>
        <tr>
          <th style={{ width: '40%' }}>Team</th>
          <th>Batting</th>
          <th>Bowling</th>
          <th>Fielding</th>
          <th>Star Rating</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.team}>
            <td>
              {row.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.logo}
                  alt={row.team}
                  width={16}
                  height={16}
                  style={{ verticalAlign: 'middle', marginRight: 6 }}
                />
              ) : null}
              <strong>{row.team}</strong>
            </td>
            <td><strong><span style={{ color: `rgb(${255 - row.batting * 2.55}, ${row.batting * 2.55}, 0)` }}>{row.batting}</span></strong></td>
            <td><strong><span style={{ color: `rgb(${255 - row.bowling * 2.55}, ${row.bowling * 2.55}, 0)` }}>{row.bowling}</span></strong></td>
            <td><strong><span style={{ color: `rgb(${255 - row.fielding * 2.55}, ${row.fielding * 2.55}, 0)` }}>{row.fielding}</span></strong></td>
            <td>{renderStars(row.ovr_rating)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}