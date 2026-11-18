// The 15 MCJROTC cadet ranks, senior first (content/usmc/ranks.json, handbook pp. 10-11).
export const CADET_RANKS = [
  'Cadet Colonel', 'Cadet Lieutenant Colonel', 'Cadet Major', 'Cadet Captain', 'Cadet First Lieutenant', 'Cadet Second Lieutenant',
  'Cadet Sergeant Major', 'Cadet First Sergeant', 'Cadet Gunnery Sergeant', 'Cadet Staff Sergeant', 'Cadet Sergeant',
  'Cadet Corporal', 'Cadet Lance Corporal', 'Cadet Private First Class', 'Cadet Private',
];
export const isCadetRank = (s: string) => CADET_RANKS.includes(s);
