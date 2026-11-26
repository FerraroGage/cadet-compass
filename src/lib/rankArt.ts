// Rank insignia pictures in public/img/ranks, by service and rank title. Sources and licenses: docs/audit/rank-insignia.md.
import type { Fact } from './bundle';

export type Service = 'cadet' | 'usmc' | 'navy';
/** [picture, short title, pay grade]. An empty picture means the rank wears no insignia. */
export type Rank = [string, string, string];

export const RANKS: Record<Service, { enlisted: Record<string, Rank>; officer: Record<string, Rank> }> = {
  cadet: {
    enlisted: {
      'Cadet Private': ['', '', ''], 'Cadet Private First Class': ['cadet-e2', '', ''], 'Cadet Lance Corporal': ['cadet-e3', '', ''],
      'Cadet Corporal': ['cadet-e4', '', ''], 'Cadet Sergeant': ['cadet-e5', '', ''], 'Cadet Staff Sergeant': ['cadet-e6', '', ''],
      'Cadet Gunnery Sergeant': ['cadet-e7', '', ''], 'Cadet First Sergeant': ['cadet-e8', '', ''], 'Cadet Sergeant Major': ['cadet-e9', '', ''],
    },
    officer: {
      'Cadet Second Lieutenant': ['cadet-o1', '', ''], 'Cadet First Lieutenant': ['cadet-o2', '', ''], 'Cadet Captain': ['cadet-o3', '', ''],
      'Cadet Major': ['cadet-o4', '', ''], 'Cadet Lieutenant Colonel': ['cadet-o5', '', ''], 'Cadet Colonel': ['cadet-o6', '', ''],
    },
  },
  usmc: {
    enlisted: {
      'Private': ['', 'Pvt', 'E-1'], 'Private First Class': ['usmc-e2', 'PFC', 'E-2'], 'Lance Corporal': ['usmc-e3', 'LCpl', 'E-3'],
      'Corporal': ['usmc-e4', 'Cpl', 'E-4'], 'Sergeant': ['usmc-e5', 'Sgt', 'E-5'], 'Staff Sergeant': ['usmc-e6', 'SSgt', 'E-6'],
      'Gunnery Sergeant': ['usmc-e7', 'GySgt', 'E-7'], 'Master Sergeant': ['usmc-e8-msgt', 'MSgt', 'E-8'], 'First Sergeant': ['usmc-e8-1stsgt', '1stSgt', 'E-8'],
      'Master Gunnery Sergeant': ['usmc-e9-mgysgt', 'MGySgt', 'E-9'], 'Sergeant Major': ['usmc-e9-sgtmaj', 'SgtMaj', 'E-9'],
      'Sergeant Major of the Marine Corps': ['usmc-e9-smmc', 'SgtMajMC', 'E-9'],
    },
    officer: {
      'Second Lieutenant': ['off-o1', '2ndLt', 'O-1'], 'First Lieutenant': ['off-o2', '1stLt', 'O-2'], 'Captain': ['off-o3', 'Capt', 'O-3'],
      'Major': ['off-o4', 'Maj', 'O-4'], 'Lieutenant Colonel': ['off-o5', 'LtCol', 'O-5'], 'Colonel': ['off-o6', 'Col', 'O-6'],
      'Brigadier General': ['off-o7', 'BGen', 'O-7'], 'Major General': ['off-o8', 'MajGen', 'O-8'],
      'Lieutenant General': ['off-o9', 'LtGen', 'O-9'], 'General': ['off-o10', 'Gen', 'O-10'],
    },
  },
  navy: {
    enlisted: {
      'Seaman Recruit': ['', 'SR', 'E-1'], 'Seaman Apprentice': ['navy-e2', 'SA', 'E-2'], 'Seaman': ['navy-e3', 'SN', 'E-3'],
      'Petty Officer Third Class': ['navy-e4', 'PO3', 'E-4'], 'Petty Officer Second Class': ['navy-e5', 'PO2', 'E-5'], 'Petty Officer First Class': ['navy-e6', 'PO1', 'E-6'],
      'Chief Petty Officer': ['navy-e7', 'CPO', 'E-7'], 'Senior Chief Petty Officer': ['navy-e8', 'SCPO', 'E-8'],
      'Master Chief Petty Officer': ['navy-e9', 'MCPO', 'E-9'], 'Master Chief Petty Officer of the Navy': ['navy-e9-mcpon', 'MCPON', 'E-9'],
    },
    officer: {
      'Ensign': ['navy-o1', 'ENS', 'O-1'], 'Lieutenant (Junior Grade)': ['navy-o2', 'LTJG', 'O-2'], 'Lieutenant': ['navy-o3', 'LT', 'O-3'],
      'Lieutenant Commander': ['navy-o4', 'LCDR', 'O-4'], 'Commander': ['navy-o5', 'CDR', 'O-5'], 'Captain': ['navy-o6', 'CAPT', 'O-6'],
      'Rear Admiral (Lower Half)': ['navy-o7', 'RDML', 'O-7'], 'Rear Admiral (Upper Half)': ['navy-o8', 'RADM', 'O-8'],
      'Vice Admiral': ['navy-o9', 'VADM', 'O-9'], 'Admiral': ['navy-o10', 'ADM', 'O-10'],
    },
  },
};

export const rankOf = (service: Service, name: string): Rank | undefined => RANKS[service].enlisted[name] ?? RANKS[service].officer[name];

/** The ranks a Marine Corps JROTC, Marine Corps or Navy rank fact names that have an insignia. A billet can name two. */
export function factRanks(f: Fact): { service: Service; name: string }[] {
  if (f.module !== 'ranks') return [];
  const service = (f.group?.match(/^(?:rank|paygrade|ins)-(usmc|navy)-/)?.[1] ?? (f.branch.includes('usmc') ? 'cadet' : undefined)) as Service | undefined;
  const name = f.group?.startsWith('paygrade-') ? f.q.match(/(?:a|an) (.+)\?$/)?.[1] : f.a;
  return service && name ? name.split(' or ').filter((n) => rankOf(service, n)?.[0]).map((n) => ({ service, name: n })) : [];
}
