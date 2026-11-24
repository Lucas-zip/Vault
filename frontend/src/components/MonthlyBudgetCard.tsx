import { useState, type FormEvent } from 'react';
import { AlertTriangle, Pencil, Plus, Wallet, X } from 'lucide-react';
import { Button, Input, Modal, FormError } from './ui';
import { ProgressBar } from './ProgressBar';
import { monthlyBudgetApi } from '../services/api';
import type { MonthlyBudgetStatusResponse } from '../types';
import { formatCurrency } from '../utils/format';

function getApiMessage(error: unknown, fallback: string): string {
  const message = (
    error as { response?: { data?: { message?: string } } }
  ).response?.data?.message;
  return message || fallback;
}

/**
 * Resumo do limite mensal de gastos exibido no dashboard.
 *
 * - Sem orçamento definido: convida a definir um limite (sem avisos).
 * - Com orçamento: mostra limite, gasto, restante e barra de uso.
 * - Excedido: exibe aviso em destaque informando o estouro.
 */
export function MonthlyBudgetCard({
  budget,
  onChanged,
}: {
  budget: MonthlyBudgetStatusResponse | null;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const defined = budget?.defined ?? false;
  const limit = budget?.limitAmount ?? 0;
  const spent = budget?.spentAmount ?? 0;
  const remaining = budget?.remainingAmount ?? 0;
  const percentage = budget?.percentageUsed ?? 0;
  const exceeded = budget?.exceeded ?? false;

  // Faixa de aviso: a partir de 75% do limite (sem ultrapassar)
  const nearLimit = defined && !exceeded && percentage >= 75;
  const status: 'ok' | 'warning' | 'exceeded' = exceeded
    ? 'exceeded'
    : nearLimit
    ? 'warning'
    : 'ok';

  return (
    <>
      <section
        className={`rounded-lg border p-5 ${
          status === 'exceeded'
            ? 'border-destructive/50 bg-destructive-soft/40'
            : status === 'warning'
            ? 'border-warning/50 bg-warning-soft/40'
            : 'border-border bg-surface'
        }`}
        aria-labelledby="monthly-budget-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {status === 'exceeded' ? (
              <AlertTriangle className="w-4 h-4 text-destructive" aria-hidden />
            ) : status === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-warning" aria-hidden />
            ) : (
              <Wallet className="w-4 h-4 text-accent" aria-hidden />
            )}
            <h3
              id="monthly-budget-title"
              className="text-sm font-medium text-foreground"
            >
              Limite mensal de gastos
            </h3>
          </div>
          {defined ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-fg transition-colors hover:text-foreground hover:bg-white/5 focus-ring"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden />
              Editar
            </button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setEditing(true)}
              className="h-8 px-3 text-xs"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden />
              Definir
            </Button>
          )}
        </div>

        {!defined ? (
          <p className="mt-3 text-sm text-muted-fg">
            Defina um limite máximo de gastos para este mês e acompanhe quanto
            ainda pode gastar.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {status === 'exceeded' && (
              <p
                className="flex items-start gap-2 text-sm text-destructive"
                role="alert"
              >
                <AlertTriangle
                  className="mt-0.5 w-4 h-4 shrink-0"
                  aria-hidden
                />
                <span>
                  Você ultrapassou seu limite de gastos mensal em{' '}
                  <strong className="font-semibold">
                    {formatCurrency(Math.abs(remaining))}
                  </strong>
                  .
                </span>
              </p>
            )}

            {status === 'warning' && (
              <p
                className="flex items-start gap-2 text-sm text-warning"
                role="alert"
              >
                <AlertTriangle
                  className="mt-0.5 w-4 h-4 shrink-0"
                  aria-hidden
                />
                <span>
                  Atenção: você já usou{' '}
                  <strong className="font-semibold">
                    {percentage.toFixed(0)}%
                  </strong>{' '}
                  do seu limite de gastos. Restam apenas{' '}
                  <strong className="font-semibold">
                    {formatCurrency(remaining)}
                  </strong>{' '}
                  até o limite mensal.
                </span>
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
              <BudgetStat label="Limite" value={formatCurrency(limit)} />
              <BudgetStat
                label="Gasto no mês"
                value={formatCurrency(spent)}
                tone={
                  status === 'exceeded'
                    ? 'negative'
                    : status === 'warning'
                    ? 'warning'
                    : 'default'
                }
              />
              <BudgetStat
                label={remaining >= 0 ? 'Disponível' : 'Excedido'}
                value={formatCurrency(Math.abs(remaining))}
                tone={
                  remaining >= 0
                    ? status === 'warning'
                      ? 'warning'
                      : 'positive'
                    : 'negative'
                }
              />
            </div>

            <div>
              <ProgressBar
                value={percentage}
                height="h-1.5"
                tone={
                  status === 'exceeded'
                    ? 'destructive'
                    : status === 'warning'
                    ? 'warning'
                    : 'accent'
                }
                label="Uso do limite mensal"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-subtle-fg">
                <span>{percentage.toFixed(0)}% do limite utilizado</span>
                <span className="tabular-nums">
                  {formatCurrency(spent)} / {formatCurrency(limit)}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {editing && (
        <BudgetModal
          period={budget?.period ?? ''}
          currentLimit={defined ? limit : null}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onChanged();
          }}
        />
      )}
    </>
  );
}

function BudgetStat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'negative' | 'warning';
}) {
  const toneClass =
    tone === 'positive'
      ? 'text-success'
      : tone === 'negative'
      ? 'text-destructive'
      : tone === 'warning'
      ? 'text-warning'
      : 'text-foreground';
  return (
    <div>
      <p className="text-xs text-subtle-fg">{label}</p>
      <p
        className={`mt-0.5 font-mono text-base font-medium tabular-nums ${toneClass}`}
      >
        {value}
      </p>
    </div>
  );
}

function BudgetModal({
  period,
  currentLimit,
  onClose,
  onSaved,
}: {
  period: string;
  currentLimit: number | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = currentLimit !== null;
  const [amount, setAmount] = useState(
    isEdit && currentLimit !== null ? String(currentLimit) : ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const value = parseFloat(amount.replace(',', '.'));
    if (!value || value <= 0) {
      setError('Informe um valor de limite válido e maior que zero.');
      return;
    }

    setSaving(true);
    try {
      await monthlyBudgetApi.upsert({
        limitAmount: value,
        period: period || undefined,
      });
      onSaved();
    } catch (err) {
      setError(getApiMessage(err, 'Não foi possível salvar o limite mensal.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? 'Editar limite mensal' : 'Definir limite mensal'}
      description="O limite vale para o mês corrente. Apenas despesas entram no cálculo."
      onClose={onClose}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3 space-y-4">
        <Input
          label="Limite máximo de gastos (R$)"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0,00"
          autoFocus
          required
        />

        {error && <FormError>{error}</FormError>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving} fullWidth>
            Salvar limite
          </Button>
        </div>

        {isEdit && (
          <RemoveBudgetButton
            period={period}
            onRemoved={() => {
              onClose();
              onSaved();
            }}
          />
        )}
      </form>
    </Modal>
  );
}

function RemoveBudgetButton({
  period,
  onRemoved,
}: {
  period: string;
  onRemoved: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');

  async function handleRemove() {
    setRemoving(true);
    setError('');
    try {
      await monthlyBudgetApi.remove(period);
      onRemoved();
    } catch (err) {
      setError(getApiMessage(err, 'Não foi possível remover o limite.'));
      setRemoving(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-subtle-fg hover:text-destructive transition-colors py-1 focus-ring rounded-md"
      >
        <X className="w-3.5 h-3.5" aria-hidden />
        Remover limite deste mês
      </button>
    );
  }

  return (
    <div className="rounded-md border border-destructive/40 bg-destructive-soft/30 p-3 space-y-2">
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <p className="text-xs text-muted-fg">
        Remover o limite? Você deixará de ver o acompanhamento mensal de gastos.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          className="h-8 flex-1 text-xs"
          onClick={() => setConfirming(false)}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="danger"
          className="h-8 flex-1 text-xs"
          loading={removing}
          onClick={handleRemove}
        >
          Remover
        </Button>
      </div>
    </div>
  );
}
