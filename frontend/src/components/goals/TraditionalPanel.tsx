import { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Plus,
  History,
  Search,
  X,
} from 'lucide-react';
import {
  Button,
  Input,
  Modal,
  FormError,
  ConfirmDialog,
} from '../ui';
import { goalApi } from '../../services/api';
import type {
  GoalDetailResponse,
  GoalMovementType,
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { todayInput } from '../../utils/goals';

function getApiMessage(error: unknown, fallback: string): string {
  const message = (
    error as { response?: { data?: { message?: string } } }
  ).response?.data?.message;
  return message || fallback;
}

/**
 * Modalidade "Meta tradicional": depósitos, retiradas e histórico manual.
 */
export function TraditionalPanel({
  detail,
  onChanged,
}: {
  detail: GoalDetailResponse;
  onChanged: (detail: GoalDetailResponse) => void;
}) {
  const [showMovement, setShowMovement] = useState<GoalMovementType | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  // Filtros de pesquisa do histórico
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const { goal, movements } = detail;

  const hasFilters = search.trim() !== '' || dateFilter !== '';

  const filteredMovements = useMemo(() => {
    const term = search.trim().toLowerCase();
    return movements.filter((m) => {
      const matchesText =
        term === '' ||
        (m.description ?? '').toLowerCase().includes(term) ||
        (m.type === 'DEPOSIT' ? 'depósito' : 'retirada').includes(term);
      const matchesDate =
        dateFilter === '' || m.movementDate.slice(0, 10) === dateFilter;
      return matchesText && matchesDate;
    });
  }, [movements, search, dateFilter]);

  function clearFilters() {
    setSearch('');
    setDateFilter('');
  }

  async function handleDeleteMovement(id: number) {
    setDeleting(true);
    setActionError('');
    try {
      await goalApi.deleteMovement(goal.id, id);
      const res = await goalApi.get(goal.id);
      onChanged(res.data);
      setDeleteTarget(null);
    } catch (err) {
      setActionError(getApiMessage(err, 'Não foi possível remover a movimentação.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setShowMovement('DEPOSIT')}>
          <Plus className="w-4 h-4" aria-hidden />
          Depositar
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowMovement('WITHDRAWAL')}
          disabled={goal.currentAmount <= 0}
        >
          <ArrowUpRight className="w-4 h-4" aria-hidden />
          Retirar
        </Button>
      </div>

      {actionError && <FormError>{actionError}</FormError>}

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-subtle-fg" aria-hidden />
            <h3 className="text-sm font-medium text-foreground">
              Histórico de movimentações
            </h3>
            {movements.length > 0 && (
              <span className="text-xs text-subtle-fg tabular-nums">
                {hasFilters
                  ? `${filteredMovements.length} de ${movements.length}`
                  : `${movements.length}`}
              </span>
            )}
          </div>
        </div>

        {movements.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex-1">
              <Input
                aria-label="Pesquisar por nome da movimentação"
                placeholder="Pesquisar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
                trailingAction={
                  search ? (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      aria-label="Limpar pesquisa"
                      className="text-subtle-fg hover:text-foreground transition-colors rounded-md p-1 focus-ring"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : undefined
                }
              />
            </div>
            <div className="sm:w-48">
              <Input
                aria-label="Filtrar por data"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                onClick={clearFilters}
                title="Limpar filtros"
              >
                <X className="w-4 h-4" aria-hidden />
                Limpar
              </Button>
            )}
          </div>
        )}

        {movements.length === 0 ? (
          <p className="py-6 text-sm text-muted-fg border-t border-border">
            Nenhuma movimentação ainda. Registre o primeiro depósito para começar.
          </p>
        ) : filteredMovements.length === 0 ? (
          <p className="py-6 text-sm text-muted-fg border-t border-border">
            Nenhuma movimentação encontrada para os filtros aplicados.
          </p>
        ) : (
          <div className="border-t border-border divide-y divide-border">
            {filteredMovements.map((m) => {
              const isDeposit = m.type === 'DEPOSIT';
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 py-3.5"
                >
                  <span
                    className={`p-2 rounded-md ${
                      isDeposit
                        ? 'bg-success-soft text-success'
                        : 'bg-destructive-soft text-destructive'
                    }`}
                  >
                    {isDeposit ? (
                      <ArrowDownLeft className="w-4 h-4" aria-hidden />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" aria-hidden />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {m.description ||
                        (isDeposit ? 'Depósito' : 'Retirada')}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-fg">
                      {formatDate(m.movementDate)}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-sm font-medium tabular-nums ${
                      isDeposit ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {isDeposit ? '+' : '−'} {formatCurrency(m.amount)}
                  </span>
                  <button
                    onClick={() => setDeleteTarget(m.id)}
                    className="text-subtle-fg hover:text-destructive hover:bg-destructive-soft transition-colors rounded-md p-2 focus-ring"
                    aria-label="Remover movimentação"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showMovement && (
        <MovementModal
          goalId={goal.id}
          type={showMovement}
          maxWithdrawal={goal.currentAmount}
          onClose={() => setShowMovement(null)}
          onSaved={(d) => {
            onChanged(d);
            setShowMovement(null);
          }}
        />
      )}

      {deleteTarget !== null && (
        <ConfirmDialog
          title="Remover movimentação"
          tone="danger"
          confirmLabel="Remover"
          loading={deleting}
          description="Esta ação recalcula o saldo acumulado da meta. Deseja continuar?"
          onConfirm={() => handleDeleteMovement(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function MovementModal({
  goalId,
  type,
  maxWithdrawal,
  onClose,
  onSaved,
}: {
  goalId: number;
  type: GoalMovementType;
  maxWithdrawal: number;
  onClose: () => void;
  onSaved: (detail: GoalDetailResponse) => void;
}) {
  const isDeposit = type === 'DEPOSIT';
  const [form, setForm] = useState({
    amount: '',
    movementDate: todayInput(),
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const amount = parseFloat(form.amount.replace(',', '.'));
    if (!amount || amount <= 0) {
      setError('Informe um valor válido.');
      return;
    }
    if (!isDeposit && amount > maxWithdrawal) {
      setError(
        `A retirada não pode ultrapassar ${formatCurrency(maxWithdrawal)}.`
      );
      return;
    }

    setSaving(true);
    try {
      const res = await goalApi.addMovement(goalId, {
        type,
        amount,
        movementDate: form.movementDate,
        description: form.description.trim() || undefined,
      });
      onSaved(res.data);
    } catch (err) {
      setError(getApiMessage(err, 'Não foi possível registrar a movimentação.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isDeposit ? 'Novo depósito' : 'Nova retirada'}
      description={
        isDeposit
          ? 'Registre quanto você guardou nesta meta.'
          : `Disponível para retirada: ${formatCurrency(maxWithdrawal)}`
      }
      onClose={onClose}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3 space-y-4">
        <Input
          label="Valor"
          type="number"
          step="0.01"
          min="0"
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
          placeholder="0,00"
          autoFocus
          required
        />
        <Input
          label="Data"
          type="date"
          value={form.movementDate}
          onChange={(e) =>
            setForm((p) => ({ ...p, movementDate: e.target.value }))
          }
          required
        />
        <Input
          label="Descrição (opcional)"
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          placeholder={isDeposit ? 'Ex.: Aporte do mês' : 'Ex.: Emergência'}
        />

        {error && <FormError>{error}</FormError>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving} fullWidth>
            {isDeposit ? 'Depositar' : 'Retirar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
