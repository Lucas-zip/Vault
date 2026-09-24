export interface Investment {
  id: string;
  name: string;
  amount: number;
  monthlyRate: number;
  createdAt: string;
}

const STORAGE_KEY = 'vault_investments';

export function getInvestments(): Investment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Investment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveInvestments(investments: Investment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
}

export function calculateMonthlyYield(investment: Investment): number {
  return investment.amount * (investment.monthlyRate / 100);
}

export function calculateTotalInvested(investments: Investment[]): number {
  return investments.reduce((sum, investment) => sum + investment.amount, 0);
}

export function calculateTotalMonthlyYield(investments: Investment[]): number {
  return investments.reduce(
    (sum, investment) => sum + calculateMonthlyYield(investment),
    0
  );
}
