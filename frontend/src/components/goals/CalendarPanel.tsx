import { useMemo, useState } from 'react';
import {
  Check,
  RefreshCw,
  Circle,
  CheckCircle2,
  Wallet,
  Target,
  Grid3x3,
} from 'lucide-react';
import { Button, Input, Select, FormError, ConfirmDialog } from '../ui';
import { ProgressBar } from '../ProgressBar';
import { goalApi } from '../../services/api';
import type {
  DepositStrategy,
  GoalDetailResponse,
  GoalSlotPlanResponse,
} from '../../types';
import { formatCurrency } from '../../utils/format';
import { DEPOSIT_STRATEGY_LABELS } from '../../utils/goals';

function getApiMessage(error: unknown, fallback: string): string {
  const message = (
    error as { response?: { data?: { message?: string } } }
  ).response?.data?.message;
  return message || fallback;
}

/**
 * Modalidade "Quadradinhos": divide a meta em N slots numerados.
 * O usuário informa quantos quadradinhos quer e a estratégia de distribuição
 * (igual / crescente / aleatório), sempre fechando o total da meta.
 *
 * Cada quadradinho tem o valor que vale. Ao tocar num quadradinho, ele é
 * marcado como preenchido (guardou aquele valor); tocar de novo o desmarca.
 */
export function CalendarPanel({
  detail,
  onChanged,
}: {
  detail: GoalDetailResponse;
  onChanged: (detail: GoalDetailResponse) => void;
}) {
  const { goal } = detail;
  const slotPlan = detail.slotPlan ?? [];

  const [strategy, setStrategy] = useState<DepositStrategy>(
    goal.depositStrategy || 'FIXED'
  );
  const [slotCount, setSlotCount] = useState('10');
  const [generating, setGenerating] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const totals = useMemo(() => {
    const planned = slotPlan.reduce((s, p) => s + p.plannedAmount, 0);
    const doneCount = slotPlan.filter((p) => p.done).length;
    return { planned, doneCount };
  }, [slotPlan]);

  async function handleGenerate() {
    const count = parseInt(slotCount, 10);
    if (!count || count < 1) {
      setError('Informe em quantos quadradinhos deseja dividir a meta.');
      return;
    }
    if (count > 500) {
      setError('O número máximo de quadradinhos é 500.');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      await goalApi.generateSlots(goal.id, {
        slotCount: count,
        strategy,
      });
      const res = await goalApi.get(goal.id);
      onChanged(res.data);
      setConfirmRegenerate(false);
    } catch (err) {
      setError(getApiMessage(err, 'Não foi possível gerar os quadradinhos.'));
    } finally {
      setGenerating(false);
    }
  }

  async function toggleSlot(item: GoalSlotPlanResponse) {
    setPendingIndex(item.slotIndex);
    setError('');
    try {
      await goalApi.updateSlot(goal.id, {
        slotIndex: item.slotIndex,
        done: !item.done,
        // Ao marcar, guarda o valor do próprio quadradinho.
        actualAmount: item.done ? undefined : item.plannedAmount,
      });
      const res = await goalApi.get(goal.id);
      onChanged(res.data);
    } catch (err) {
      setError(getApiMessage(err, 'Não foi possível atualizar o quadradinho.'));
    } finally {
      setPendingIndex(null);
    }
  }

  // ===== Estado vazio: ainda não há quadradinhos =====
  if (slotPlan.length === 0) {
    return (
      <div className="space-y-5">
        <div className="rounded-md border border-border bg-surface-raised px-4 py-3 text-sm text-muted-fg">
          Divida sua meta em quadradinhos e vá preenchendo aos poucos. Cada
          quadradinho tem um valor — ao marcá-lo, você está guardando aquele
          valor. No final, a soma dos quadradinhos alcança a meta.
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="w-full sm:max-w-[160px]">
            <Input
              label="Quadradinhos"
              type="number"
              min="1"
              max="500"
              value={slotCount}
              onChange={(e) => setSlotCount(e.target.value)}
            />
          </div>
          <div className="sm:max-w-xs w-full">
            <Select
              label="Distribuição planejada"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as DepositStrategy)}
            >
              <option value="FIXED">{DEPOSIT_STRATEGY_LABELS.FIXED}</option>
              <option value="INCREASING">
                {DEPOSIT_STRATEGY_LABELS.INCREASING}
              </option>
              <option value="RANDOM">{DEPOSIT_STRATEGY_LABELS.RANDOM}</option>
            </Select>
          </div>
          <Button onClick={() => handleGenerate()} loading={generating}>
            <Grid3x3 className="w-4 h-4" aria-hidden />
            Gerar quadradinhos
          </Button>
        </div>
        <p className="text-xs text-subtle-fg">
          O valor restante ({formatCurrency(goal.remainingAmount)}) será dividido
          entre os quadradinhos.
        </p>
        {error && <FormError>{error}</FormError>}
      </div>
    );
  }

  // ===== Estado com quadradinhos gerados =====
  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-y border-border divide-y sm:divide-y-0 sm:divide-x divide-border">
        <CalMetric
          label="Total planejado"
          value={formatCurrency(totals.planned)}
          icon={<Target className="w-4 h-4" />}
          tone="accent"
        />
        <CalMetric
          label="Acumulado na meta"
          value={formatCurrency(goal.currentAmount)}
          icon={<Wallet className="w-4 h-4" />}
          tone="neutral"
        />
        <CalMetric
          label="Quadradinhos preenchidos"
          value={`${totals.doneCount}/${slotPlan.length}`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          tone="success"
        />
        <CalMetric
          label="Falta para a meta"
          value={formatCurrency(goal.remainingAmount)}
          icon={<Target className="w-4 h-4" />}
          tone="neutral"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-subtle-fg">Progresso da meta</span>
          <span className="font-mono text-xs tabular-nums text-muted-fg">
            {goal.percentage.toFixed(0)}%
          </span>
        </div>
        <ProgressBar value={goal.percentage} completed={goal.completed} />
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 flex-1">
          <div className="w-full sm:max-w-[160px]">
            <Input
              label="Quadradinhos"
              type="number"
              min="1"
              max="500"
              value={slotCount}
              onChange={(e) => setSlotCount(e.target.value)}
            />
          </div>
          <div className="sm:max-w-xs w-full">
            <Select
              label="Distribuição"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as DepositStrategy)}
            >
              <option value="FIXED">{DEPOSIT_STRATEGY_LABELS.FIXED}</option>
              <option value="INCREASING">
                {DEPOSIT_STRATEGY_LABELS.INCREASING}
              </option>
              <option value="RANDOM">{DEPOSIT_STRATEGY_LABELS.RANDOM}</option>
            </Select>
          </div>
          <Button
            variant="secondary"
            onClick={() => setConfirmRegenerate(true)}
            loading={generating}
          >
            <RefreshCw className="w-4 h-4" aria-hidden />
            Recalcular
          </Button>
        </div>
      </div>

      {error && <FormError>{error}</FormError>}

      {/* Grade de quadradinhos */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {slotPlan.map((item) => {
          const pending = pendingIndex === item.slotIndex;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (!pending) toggleSlot(item);
              }}
              disabled={pending}
              className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-md border p-3 transition-colors focus-ring disabled:opacity-60 ${
                item.done
                  ? 'border-success/30 bg-success-soft/40'
                  : 'border-border hover:border-border-strong'
              }`}
              aria-pressed={item.done}
              aria-label={`Quadradinho ${item.slotIndex + 1}: ${
                item.done ? 'preenchido' : 'vazio'
              }, ${formatCurrency(item.plannedAmount)}`}
            >
              <span
                className={`inline-flex items-center justify-center w-7 h-7 rounded-md ${
                  item.done
                    ? 'bg-success text-[#0b0b0c]'
                    : 'bg-surface-raised text-subtle-fg'
                }`}
              >
                {pending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : item.done ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </span>
              <span className="text-[10px] uppercase text-subtle-fg">
                #{item.slotIndex + 1}
              </span>
              <span
                className={`font-mono text-xs tabular-nums ${
                  item.done ? 'text-success' : 'text-muted-fg'
                }`}
              >
                {formatCurrency(item.plannedAmount)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-subtle-fg">
        Toque em um quadradinho para marcá-lo como guardado (o valor dele é o que
        você está guardando). Toque de novo para desmarcar.
      </p>

      {confirmRegenerate && (
        <ConfirmDialog
          title="Recalcular quadradinhos"
          confirmLabel="Recalcular"
          loading={generating}
          description={
            <>
              Os quadradinhos serão recriados e o valor restante será
              redistribuído conforme a estratégia escolhida. Os quadradinhos já
              preenchidos serão mantidos. Deseja continuar?
            </>
          }
          onConfirm={() => handleGenerate()}
          onClose={() => setConfirmRegenerate(false)}
        />
      )}
    </div>
  );
}

function CalMetric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: 'accent' | 'success' | 'neutral';
}) {
  const tones = {
    accent: 'text-accent',
    success: 'text-success',
    neutral: 'text-subtle-fg',
  };
  return (
    <div className="px-0 py-4 sm:px-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-subtle-fg">{label}</span>
        <span className={tones[tone]}>{icon}</span>
      </div>
      <p className="mt-1.5 font-mono text-base font-medium tabular-nums text-foreground truncate">
        {value}
      </p>
    </div>
  );
}
