export type Appreciation = 'Très bien' | 'Bien' | 'Assez bien' | 'Passable' | 'Insuffisant';

/**
 * Barème officiel d'appréciation d'une moyenne (sur 20).
 */
export function appreciation(moyenne: number): Appreciation {
  if (moyenne >= 16) return 'Très bien';
  if (moyenne >= 14) return 'Bien';
  if (moyenne >= 12) return 'Assez bien';
  if (moyenne >= 10) return 'Passable';
  return 'Insuffisant';
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export interface WeightedItem {
  value: number;
  coefficient: number;
}

/**
 * Moyenne pondérée : Σ(valeur × coef) / Σ(coef), arrondie à 2 décimales.
 * Retourne null si aucun élément (aucune note).
 */
export function weightedAverage(items: WeightedItem[]): number | null {
  const totalWeight = items.reduce((sum, item) => sum + item.coefficient, 0);
  if (items.length === 0 || totalWeight <= 0) return null;
  const total = items.reduce((sum, item) => sum + item.value * item.coefficient, 0);
  return round2(total / totalWeight);
}

export interface SubjectAverage {
  coefficient: number;
  average: number;
}

/**
 * Moyenne générale : Σ(moyenne matière × coef matière) / Σ(coef matières), arrondie à 2 décimales.
 */
export function generalAverage(subjects: SubjectAverage[]): number | null {
  return weightedAverage(subjects.map((s) => ({ value: s.average, coefficient: s.coefficient })));
}

/**
 * Classement « compétition » : les ex æquo partagent le rang et les rangs suivants
 * sautent le nombre d'ex æquo (1, 1, 3). `averages` doit être trié décroissant.
 */
export function competitionRanks(averages: number[]): number[] {
  const ranks: number[] = [];
  averages.forEach((avg, index) => {
    if (index > 0 && avg === averages[index - 1]) {
      ranks.push(ranks[index - 1] as number);
    } else {
      ranks.push(index + 1);
    }
  });
  return ranks;
}
