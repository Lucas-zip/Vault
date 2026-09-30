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

export interface InvestmentSimulation {
  /** Valor já investido */
  currentAmount: number;
  /** Valor do novo aporte */
  newAmount: number;
  /** Total investido após o aporte (atual + novo) */
  totalAmount: number;
  /** Rendimento mensal do valor atual */
  currentMonthlyYield: number;
  /** Rendimento mensal adicional gerado pelo novo aporte */
  newMonthlyYield: number;
  /** Rendimento mensal total após o aporte */
  totalMonthlyYield: number;
}

/**
 * Simula um novo aporte em um investimento.
 * Soma o valor já investido com o novo aporte e calcula
 * o rendimento mensal com base na taxa mensal do investimento.
 */
export function simulateInvestment(
  investment: Investment,
  newAmount: number
): InvestmentSimulation {
  const currentAmount = investment.amount;
  const currentMonthlyYield = currentAmount * (investment.monthlyRate / 100);
  const newMonthlyYield = newAmount * (investment.monthlyRate / 100);
  const totalAmount = currentAmount + newAmount;

  return {
    currentAmount,
    newAmount,
    totalAmount,
    currentMonthlyYield,
    newMonthlyYield,
    totalMonthlyYield: currentMonthlyYield + newMonthlyYield,
  };
}

