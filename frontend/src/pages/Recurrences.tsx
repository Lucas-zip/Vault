import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Plus,
  Play,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Pencil,
  CalendarDays,
  Repeat,
  Hash,
  Wallet,
  Tag,
  CircleDot,
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  EmptyState,
  PageHeader,
  LoadingRows,
  Modal,
  FormError,
  ErrorState,
  ConfirmDialog,
} from '../components/ui';
import { recurrenceApi, accountApi, categoryApi } from '../services/api';
import type { RecurrenceResponse, AccountResponse, CategoryResponse } from '../types';
import { formatCurrency } from '../utils/format';

const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: 'Diária',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
};

export function Recurrences() {
  const [recurrences, setRecurrences] = useState<RecurrenceResponse[]>([]);
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState('');
  const [executingId, setExecutingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [executeTarget, setExecuteTarget] = useState<RecurrenceResponse | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<RecurrenceResponse | null>(
    null
  );
  const [detailTarget, setDetailTarget] = useState<RecurrenceResponse | null>(
    null
  );

  async function fetchData() {
    try {
      const [r, a, c] = await Promise.all([
        recurrenceApi.list(),
        accountApi.list(),
        categoryApi.list(),
      ]);
      setRecurrences(r.data ?? []);
      setAccounts(a.data?.content ?? []);
      setCategories(c.data ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function load() {
    setLoading(true);
    setError(false);
    void fetchData();
  }

  useEffect(() => {
    void fetchData();
  }, []);

  async function handleExecute(recurrence: RecurrenceResponse) {
    // Guarda contra execução simultânea (clique duplo / reenvio)
    if (executingId !== null) return;
    setActionError('');
    setExecutingId(recurrence.id);
    try {
      await recurrenceApi.execute(recurrence.id);
      setExecuteTarget(null);
      load();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Não foi possível executar a recorrência. Tente novamente.';
      setActionError(message);
    } finally {
      setExecutingId(null);
    }
  }

  async function handleDelete(id: number) {
    setDeleteTarget(null);
    setActionError('');
    setDeletingId(id);
    try {
      await recurrenceApi.delete(id);
      load();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Não foi possível excluir a recorrência. Tente novamente.';
      setActionError(message);
    } finally {
      setDeletingId(null);
    }
  }

  const active = useMemo(
    () => recurrences.filter((r) => r.active),
    [recurrences]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recorrências"
        description="Automatize lançamentos que se repetem."
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" aria-hidden />
            Nova recorrência
          </Button>
        }
      />

      {actionError && <FormError>{actionError}</FormError>}

      {loading ? (
        <div className="border-t border-border pt-5">
          <LoadingRows rows={4} />
        </div>
      ) : error ? (
        <div className="border-t border-border">
          <ErrorState
            action={
              <Button variant="secondary" onClick={load}>
                Tentar novamente
              </Button>
            }
          />
        </div>
      ) : active.length === 0 ? (
        <div className="border-t border-border">
          <EmptyState
            title="Nenhuma recorrência"
            description="Crie lançamentos automáticos como aluguel, assinaturas ou salários."
            action={
              <Button onClick={() => setShowForm(true)} variant="secondary">
                <Plus className="w-4 h-4" aria-hidden />
                Nova recorrência
              </Button>
            }
          />
        </div>
      ) : (
        <div className="border-t border-border">
          <ul className="divide-y divide-border">
            {active.map((r) => (
              <li
                key={r.id}
                className="flex items-start sm:items-center gap-3 py-3 transition-colors hover:bg-white/[0.03]"
              >
                <span
                  className={`p-2 rounded-md shrink-0 ${
                    r.type === 'INCOME'
                      ? 'bg-success-soft text-success'
                      : 'bg-destructive-soft text-destructive'
                  }`}
                >
                  {r.type === 'INCOME' ? (
                    <ArrowUpRight className="w-4 h-4" aria-hidden />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" aria-hidden />
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {r.description || r.categoryName || 'Sem descrição'}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-fg truncate">
                    {r.accountName}
                    {r.categoryName ? ` · ${r.categoryName}` : ''}
                    {' · '}
                    {FREQUENCY_LABELS[r.frequency] ?? r.frequency}
                    {' · Ativa'}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-2">
                  <span
                    className={`font-mono text-sm font-medium tabular-nums ${
                      r.type === 'INCOME' ? 'text-success' : 'text-foreground'
                    }`}
                  >
                    {r.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(r.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDetailTarget(r)}
                      className="text-subtle-fg hover:text-accent hover:bg-accent-soft transition-colors rounded-md p-2 focus-ring"
                      title="Ver detalhes e editar"
                      aria-label={`Ver detalhes de ${r.description || 'recorrência'}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExecuteTarget(r)}
                      disabled={executingId === r.id}
                      className="text-subtle-fg hover:text-success hover:bg-success-soft transition-colors rounded-md p-2 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Executar agora"
                      aria-label={`Executar agora ${r.description || 'recorrência'}`}
                    >
                      {executingId === r.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(r)}
                      disabled={deletingId === r.id}
                      className="text-subtle-fg hover:text-destructive hover:bg-destructive-soft transition-colors rounded-md p-2 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Excluir"
                      aria-label={`Excluir ${r.description || 'recorrência'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showForm && (
        <RecurrenceForm
          accounts={accounts}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {executeTarget && (
        <ConfirmDialog
          title="Executar recorrência"
          tone="warning"
          confirmLabel="Executar agora"
          description={
            <>
              Deseja executar{' '}
              <span className="text-foreground font-medium">
                “{executeTarget.description || executeTarget.categoryName || 'esta recorrência'}”
              </span>{' '}
              agora?
              <br />
              Isso irá gerar as ocorrências pendentes e alterar o saldo da conta{' '}
              <span className="text-foreground font-medium">
                {executeTarget.accountName}
              </span>
              . Ocorrências já geradas não serão duplicadas.
            </>
          }
          loading={executingId === executeTarget.id}
          onConfirm={() => handleExecute(executeTarget)}
          onClose={() => setExecuteTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Excluir recorrência"
          tone="danger"
          confirmLabel="Excluir"
          description={
            <>
              Deseja excluir{' '}
              <span className="text-foreground font-medium">
                “{deleteTarget.description || deleteTarget.categoryName || 'esta recorrência'}”
              </span>
              ? As transações já geradas não serão removidas.
            </>
          }
          loading={deletingId === deleteTarget.id}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {detailTarget && (
        <RecurrenceDetailModal
          recurrence={detailTarget}
          accounts={accounts}
          categories={categories}
          onClose={() => setDetailTarget(null)}
          onSaved={() => {
            setDetailTarget(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function RecurrenceForm({
  accounts,
  categories,
  recurrence,
  onClose,
  onSaved,
}: {
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  recurrence?: RecurrenceResponse;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(recurrence);
  const [form, setForm] = useState({
    description: recurrence?.description ?? '',
    amount: recurrence ? String(recurrence.amount) : '',
    type: recurrence?.type ?? 'EXPENSE',
    frequency: recurrence?.frequency ?? 'MONTHLY',
    startDate:
      recurrence?.startDate ?? new Date().toISOString().slice(0, 10),
    endDate: recurrence?.endDate ?? '',
    accountId: recurrence ? String(recurrence.accountId) : '',
    categoryId: recurrence?.categoryId ? String(recurrence.categoryId) : '',
    active: recurrence?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const catOptions = useMemo(
    () =>
      categories.filter(
        (c) => c.type === (form.type === 'INCOME' ? 'INCOME' : 'EXPENSE')
      ),
    [categories, form.type]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const amount = parseFloat(form.amount.replace(',', '.'));
    if (!amount || amount <= 0) {
      setError('Informe um valor válido.');
      return;
    }
    if (!form.accountId) {
      setError('Selecione uma conta.');
      return;
    }
    if (form.endDate && form.endDate < form.startDate) {
      setError('A data final não pode ser anterior à data inicial.');
      return;
    }
    setSaving(true);
    try {
      if (isEdit && recurrence) {
        const catName = categories.find(
          (c) => c.id === Number(form.categoryId)
        )?.name;
        await recurrenceApi.update(recurrence.id, {
          description:
            form.description.trim() || catName || 'Recorrência',
          amount,
          type: form.type,
          frequency: form.frequency,
          startDate: form.startDate,
          endDate: form.endDate || undefined,
          accountId: Number(form.accountId),
          categoryId: form.categoryId ? Number(form.categoryId) : undefined,
          active: form.active,
        });
      } else {
        await recurrenceApi.create({
          description: form.description.trim() || undefined,
          amount,
          type: form.type,
          frequency: form.frequency,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          accountId: Number(form.accountId),
          categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        });
      }
      onSaved();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (isEdit
          ? 'Não foi possível salvar as alterações.'
          : 'Não foi possível criar a recorrência.');
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? 'Editar recorrência' : 'Nova recorrência'}
      description={
        isEdit
          ? 'Altere as informações desta recorrência.'
          : 'Configure um lançamento que se repete automaticamente.'
      }
      onClose={onClose}
      className="max-w-lg max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3 space-y-4">
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Tipo de recorrência">
          {(['EXPENSE', 'INCOME'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setForm((p) => ({ ...p, type, categoryId: '' }))}
              className={`h-9 rounded-md px-3 text-sm font-medium transition-colors ${
                form.type === type
                  ? 'bg-surface-raised text-foreground border border-border-strong'
                  : 'border border-transparent bg-transparent text-muted-fg hover:bg-white/5 hover:text-foreground'
              }`}
            >
              {type === 'INCOME' ? 'Receita' : 'Despesa'}
            </button>
          ))}
        </div>

        <Input
          label="Descrição"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Ex.: Aluguel, Internet"
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Valor"
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            placeholder="0,00"
            required
          />
          <Select
            label="Frequência"
            value={form.frequency}
            onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))}
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {FREQUENCY_LABELS[f]}
              </option>
            ))}
          </Select>
        </div>
        <Input
          label="Início"
          type="date"
          value={form.startDate}
          onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
        />
        <Input
          label="Fim (opcional)"
          type="date"
          value={form.endDate}
          onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
          hint="Deixe em branco para uma recorrência sem data para terminar."
        />
        <Select
          label="Conta"
          value={form.accountId}
          onChange={(e) => setForm((p) => ({ ...p, accountId: e.target.value }))}
          required
        >
          <option value="">Selecione a conta</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <Select
          label="Categoria"
          value={form.categoryId}
          onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
        >
          <option value="">Sem categoria</option>
          {catOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        {isEdit && (
          <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface-raised px-4 py-3">
            <span>
              <span className="block text-sm font-medium text-foreground">
                Recorrência ativa
              </span>
              <span className="mt-0.5 block text-xs text-muted-fg">
                Recorrências inativas não aparecem na listagem nem são executadas.
              </span>
            </span>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((p) => ({ ...p, active: e.target.checked }))
              }
              className="h-4 w-4 shrink-0 accent-accent"
            />
          </label>
        )}

        {error && <FormError>{error}</FormError>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving} fullWidth>
            {isEdit ? 'Salvar alterações' : 'Criar recorrência'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

const MONTHS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

/** Formata uma data ISO (yyyy-MM-dd) como "01 de jul. de 2026". */
function formatLongDate(iso?: string): string {
  if (!iso) return '—';
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return iso;
  return `${String(day).padStart(2, '0')} de ${MONTHS[month - 1]}. de ${year}`;
}

/** Calcula a próxima data de execução a partir do início e da frequência. */
function computeNextExecution(r: RecurrenceResponse): string | null {
  if (!r.startDate) return null;
  const [y, m, d] = r.startDate.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = r.endDate
    ? (() => {
        const [ey, em, ed] = r.endDate.split('-').map(Number);
        return new Date(ey, em - 1, ed);
      })()
    : null;

  const next = new Date(start);
  const advance = () => {
    switch (r.frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        next.setMonth(next.getMonth() + 1);
    }
  };

  // Avança até estar em uma data >= hoje
  let guard = 0;
  while (next < today && guard < 10000) {
    advance();
    guard += 1;
  }

  if (end && next > end) return null;

  const pad = (v: number) => String(v).padStart(2, '0');
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
}

function RecurrenceDetailModal({
  recurrence,
  accounts,
  categories,
  onClose,
  onSaved,
}: {
  recurrence: RecurrenceResponse;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <RecurrenceForm
        accounts={accounts}
        categories={categories}
        recurrence={recurrence}
        onClose={() => setEditing(false)}
        onSaved={onSaved}
      />
    );
  }

  const executionCount = recurrence.executionCount ?? 0;
  const totalGenerated = executionCount * recurrence.amount;
  const nextExecution = computeNextExecution(recurrence);
  const title =
    recurrence.description || recurrence.categoryName || 'Recorrência';

  return (
    <Modal
      title="Detalhes da recorrência"
      description={title}
      onClose={onClose}
      className="max-w-lg max-h-[90vh] overflow-y-auto"
    >
      <div className="px-5 pb-5 pt-1 space-y-5">
        {/* Status + valor */}
        <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface-raised px-4 py-3.5">
          <div>
            <p className="text-xs text-subtle-fg">
              {recurrence.type === 'INCOME' ? 'Receita recorrente' : 'Despesa recorrente'}
            </p>
            <p
              className={`mt-1 font-mono text-2xl font-medium tabular-nums ${
                recurrence.type === 'INCOME' ? 'text-success' : 'text-foreground'
              }`}
            >
              {recurrence.type === 'INCOME' ? '+' : '-'}
              {formatCurrency(recurrence.amount)}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium ${
              recurrence.active
                ? 'bg-success-soft text-success'
                : 'bg-surface-muted text-muted-fg'
            }`}
          >
            <CircleDot className="w-3 h-3" aria-hidden />
            {recurrence.active ? 'Ativa' : 'Inativa'}
          </span>
        </div>

        {/* Resumo da inspeção */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ReportItem
            icon={<Hash className="w-4 h-4" aria-hidden />}
            label="Vezes executada"
            value={`${executionCount} ${executionCount === 1 ? 'vez' : 'vezes'}`}
          />
          <ReportItem
            icon={<Repeat className="w-4 h-4" aria-hidden />}
            label="Frequência"
            value={FREQUENCY_LABELS[recurrence.frequency] ?? recurrence.frequency}
          />
          <ReportItem
            icon={<CalendarDays className="w-4 h-4" aria-hidden />}
            label="Início"
            value={formatLongDate(recurrence.startDate)}
          />
          <ReportItem
            icon={<CalendarDays className="w-4 h-4" aria-hidden />}
            label="Fim"
            value={recurrence.endDate ? formatLongDate(recurrence.endDate) : 'Sem fim'}
          />
          <ReportItem
            icon={<Wallet className="w-4 h-4" aria-hidden />}
            label="Conta"
            value={recurrence.accountName ?? '—'}
          />
          <ReportItem
            icon={<Tag className="w-4 h-4" aria-hidden />}
            label="Categoria"
            value={recurrence.categoryName ?? 'Sem categoria'}
          />
        </div>

        {/* Totais gerados */}
        <div className="rounded-md border border-border bg-surface-raised divide-y divide-border">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-sm text-muted-fg">Total já lançado</span>
            <span className="font-mono text-sm font-medium tabular-nums text-foreground">
              {formatCurrency(totalGenerated)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-sm text-muted-fg">Próxima execução</span>
            <span className="text-sm font-medium text-foreground">
              {nextExecution ? formatLongDate(nextExecution) : 'Sem próxima execução'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-sm text-muted-fg">Criada em</span>
            <span className="text-sm text-foreground">
              {recurrence.createdAt
                ? new Date(recurrence.createdAt).toLocaleDateString('pt-BR')
                : '—'}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Fechar
          </Button>
          <Button
            type="button"
            fullWidth
            onClick={() => setEditing(true)}
          >
            <Pencil className="w-4 h-4" aria-hidden />
            Editar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ReportItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-raised px-4 py-3">
      <div className="flex items-center gap-2 text-subtle-fg">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1.5 text-sm font-medium text-foreground truncate">
        {value}
      </p>
    </div>
  );
}
