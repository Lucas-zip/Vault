import { useEffect, useMemo, useState } from 'react';
import { Loader2, Info } from 'lucide-react';
import { Input, Select } from '../ui';
import { EvolutionChart } from '../EvolutionChart';
import { goalApi } from '../../services/api';
import type { GoalResponse, InvestmentSimulationResponse } from '../../types';
import { formatCurrency } from '../../utils/format';

type RatePeriod = 'ANNUAL' | 'MONTHLY';

function parseNumber(value: string): number {
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Modalidade "Calculadora de investimentos" — inspirada na calculadora
 * "Primeiro Milhão" do Investidor10. Simula juros compostos com aportes
 * mensais e permite descobrir o aporte necessário para um prazo.
 */
export function CalculatorPanel({ goal }: { goal: GoalResponse }) {
  const [initial, setInitial] = useState(String(goal.currentAmount || 0));
  const [target, setTarget] = useState(String(goal.targetAmount || 0));
  const [contribution, setContribution] = useState('500');
  const [rate, setRate] = useState('10');
  const [ratePeriod, setRatePeriod] = useState<RatePeriod>('ANNUAL');
  const [mode, setMode] = useState<'time' | 'contribution'>('time');
  const [months, setMonths] = useState('12');

  const [result, setResult] = useState<InvestmentSimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const payload = useMemo(() => {
    const initialValue = parseNumber(initial);
    const targetValue = parseNumber(target);
    return {
      initialAmount: initialValue,
      targetAmount: targetValue,
      monthlyContribution:
        mode === 'contribution' ? 0 : parseNumber(contribution),
      rate: parseNumber(rate),
      ratePeriod,
      months:
        mode === 'contribution' ? Math.max(1, Math.round(parseNumber(months))) : undefined,
    };
  }, [initial, target, contribution, rate, ratePeriod, mode, months]);

  useEffect(() => {
    const targetValue = parseNumber(target);
    if (targetValue <= 0) {
      setResult(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    const handle = setTimeout(async () => {
      try {
        const res = await goalApi.simulate(payload);
        if (!cancelled) setResult(res.data);
      } catch (err) {
        if (!cancelled) {
          const message = (
            err as { response?: { data?: { message?: string } } }
          ).response?.data?.message;
          setError(message || 'Não foi possível calcular a simulação.');
          setResult(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [payload, target]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_1fr] gap-6">
        {/* ===== Parâmetros ===== */}
        <div className="space-y-4">
          <div className="flex gap-1 rounded-md bg-surface-muted p-1">
            <ModeTab
              active={mode === 'time'}
              onClick={() => setMode('time')}
              label="Tempo estimado"
            />
            <ModeTab
              active={mode === 'contribution'}
              onClick={() => setMode('contribution')}
              label="Aporte necessário"
            />
          </div>

          <Input
            label="Patrimônio inicial"
            type="number"
            step="0.01"
            min="0"
            value={initial}
            onChange={(e) => setInitial(e.target.value)}
          />
          <Input
            label="Patrimônio desejado"
            type="number"
            step="0.01"
            min="0"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />

          {mode === 'time' ? (
            <Input
              label="Aporte mensal"
              type="number"
              step="0.01"
              min="0"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
            />
          ) : (
            <Input
              label="Prazo (meses)"
              type="number"
              step="1"
              min="1"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
            />
          )}

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Input
              label="Rentabilidade"
              type="number"
              step="0.01"
              min="-99"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <Select
              label="Período"
              value={ratePeriod}
              onChange={(e) => setRatePeriod(e.target.value as RatePeriod)}
            >
              <option value="ANNUAL">ao ano</option>
              <option value="MONTHLY">ao mês</option>
            </Select>
          </div>

          {result && (
            <p className="text-xs text-subtle-fg">
              Taxa efetiva:{' '}
              <span className="text-muted-fg font-mono">
                {(result.monthlyRate * 100).toFixed(3)}% a.m.
              </span>
            </p>
          )}
        </div>

        {/* ===== Resultados ===== */}
        <div className="space-y-5">
          {error && (
            <div className="rounded-md bg-destructive-soft border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label={
                mode === 'contribution'
                  ? 'Aporte mensal necessário'
                  : 'Tempo estimado'
              }
              highlight
              loading={loading}
              value={
                result
                  ? mode === 'contribution'
                    ? formatCurrency(result.requiredMonthlyContribution ?? 0)
                    : formatGoalTime(result.yearsToGoal, result.remainingMonths)
                  : '—'
              }
            />
            <ResultCard
              label="Total investido"
              loading={loading}
              value={result ? formatCurrency(result.totalInvested) : '—'}
            />
            <ResultCard
              label="Rendimento (juros)"
              loading={loading}
              tone="success"
              value={result ? formatCurrency(result.totalInterest) : '—'}
            />
            <ResultCard
              label="Patrimônio final"
              loading={loading}
              value={result ? formatCurrency(result.finalAmount) : '—'}
            />
          </div>

          {result && result.evolution.length > 1 ? (
            <div className="border-t border-border pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">
                  Evolução do patrimônio
                </h3>
                {loading && (
                  <Loader2 className="w-4 h-4 animate-spin text-subtle-fg" />
                )}
              </div>
              <EvolutionChart data={result.evolution} />
            </div>
          ) : (
            <div className="border-t border-border pt-6 text-sm text-muted-fg">
              Informe um patrimônio desejado maior que o inicial para ver a
              projeção.
            </div>
          )}

          {result?.disclaimer && (
            <p className="flex items-start gap-2 text-xs text-subtle-fg leading-relaxed">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden />
              {result.disclaimer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 h-8 rounded-md text-sm transition-colors focus-ring ${
        active
          ? 'bg-surface-raised text-foreground font-medium'
          : 'text-muted-fg hover:text-foreground'
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function ResultCard({
  label,
  value,
  loading,
  highlight = false,
  tone,
}: {
  label: string;
  value: string;
  loading?: boolean;
  highlight?: boolean;
  tone?: 'success';
}) {
  return (
    <div className="px-0">
      <p className="text-xs text-subtle-fg">{label}</p>
      <p
        className={`mt-1.5 font-mono tabular-nums font-medium ${
          highlight ? 'text-xl md:text-2xl' : 'text-lg'
        } ${tone === 'success' ? 'text-success' : 'text-foreground'} ${
          loading ? 'opacity-50' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatGoalTime(years: number, months: number): string {
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
  if (parts.length === 0) return '1 mês';
  return parts.join(' e ');
}
