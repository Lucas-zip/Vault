import type { GoalModality, DepositStrategy } from '../types';

export const GOAL_MODALITY_LABELS: Record<GoalModality, string> = {
  TRADITIONAL: 'Meta tradicional',
  INVESTMENT_CALCULATOR: 'Calculadora de investimentos',
  DEPOSIT_CALENDAR: 'Quadradinhos',
};

export const GOAL_MODALITY_DESCRIPTIONS: Record<GoalModality, string> = {
  TRADITIONAL: 'Acompanhe manualmente com depósitos e retiradas.',
  INVESTMENT_CALCULATOR: 'Projete juros compostos e aportes até o objetivo.',
  DEPOSIT_CALENDAR: 'Divida a meta em quadradinhos e preencha aos poucos.',
};

export const DEPOSIT_STRATEGY_LABELS: Record<DepositStrategy, string> = {
  FIXED: 'Valores iguais',
  INCREASING: 'Valores crescentes',
  CUSTOM: 'Personalizado',
  RANDOM: 'Aleatório',
};

/** Converte uma data (ISO / Date) para o formato de input date (yyyy-mm-dd). */
export function toDateInput(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Data de hoje no formato input date. */
export function todayInput(): string {
  return toDateInput(new Date());
}

/** Número de dias entre duas datas ISO (inclusivo). */
export function daysBetween(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return diff + 1;
}

/** Formata um percentual limitando a exibição a 100% (para barras). */
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}
