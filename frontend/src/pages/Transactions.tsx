import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Trash2,
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
import { transactionApi, transferApi, accountApi, categoryApi } from '../services/api';
import type {
  TransactionResponse,
  AccountResponse,
  CategoryResponse,
} from '../types';
import { formatCurrency, formatDate, TYPE_LABELS } from '../utils/format';

export function Transactions() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<TransactionResponse | null>(
    null
  );

  async function fetchData() {
    try {
      const [t, a, c] = await Promise.all([
        transactionApi.list(),
        accountApi.list(),
        categoryApi.list(),
      ]);
      setTransactions(t.data?.content ?? []);
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

  async function handleDelete(id: number) {
    setConfirmTarget(null);
    setActionError('');
    setDeletingId(id);
    try {
      await transactionApi.delete(id);
      load();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Não foi possível excluir a transação. Tente novamente.';
      setActionError(message);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    let list = transactions;
    if (filterType) list = list.filter((t) => t.type === filterType);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description?.toLowerCase().includes(q) ||
          t.accountName?.toLowerCase().includes(q) ||
          t.categoryName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, filterType, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transações"
        description="Registre e acompanhe seus lançamentos."
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" aria-hidden />
            Nova transação
          </Button>
        }
      />

      {actionError && <FormError>{actionError}</FormError>}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descrição, conta ou categoria"
            icon={<Search className="w-4 h-4" />}
            aria-label="Buscar transações"
          />
        </div>
        <Select
          className="sm:w-48"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          aria-label="Filtrar por tipo"
        >
          <option value="">Todas</option>
          <option value="INCOME">Receitas</option>
          <option value="EXPENSE">Despesas</option>
          <option value="TRANSFER">Transferências</option>
        </Select>
      </div>

      <div className="border-t border-border">
        {loading ? (
          <LoadingRows rows={5} className="py-3" />
        ) : error ? (
          <ErrorState
            action={
              <Button variant="secondary" onClick={load}>
                Tentar novamente
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma transação encontrada"
            description="Cadastre sua primeira transação para começar a registrar seus lançamentos."
            action={
              <Button onClick={() => setShowForm(true)} variant="secondary">
                <Plus className="w-4 h-4" aria-hidden />
                Nova transação
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 py-3 transition-colors hover:bg-white/[0.03]"
              >
                <span
                  className={`p-2 rounded-md shrink-0 ${
                    t.type === 'INCOME'
                      ? 'bg-success-soft text-success'
                      : t.type === 'EXPENSE'
                      ? 'bg-destructive-soft text-destructive'
                      : 'bg-info-soft text-info'
                  }`}
                >
                  {t.type === 'INCOME' ? (
                    <ArrowUpRight className="w-4 h-4" aria-hidden />
                  ) : t.type === 'EXPENSE' ? (
                    <ArrowDownRight className="w-4 h-4" aria-hidden />
                  ) : (
                    <ArrowLeftRight className="w-4 h-4" aria-hidden />
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {t.description || t.categoryName || 'Sem descrição'}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-fg truncate">
                    {t.accountName}
                    {t.categoryName ? ` · ${t.categoryName}` : ''}
                    {t.type !== 'TRANSFER' ? ` · ${TYPE_LABELS[t.type]}` : ''}
                    {t.transactionDate
                      ? ` · ${formatDate(t.transactionDate)}`
                      : ''}
                  </p>
                </div>

                <span
                  className={`font-mono text-sm font-medium tabular-nums shrink-0 ${
                    t.type === 'INCOME' ? 'text-success' : 'text-foreground'
                  }`}
                >
                  {t.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(t.amount)}
                </span>

                <button
                  onClick={() => setConfirmTarget(t)}
                  disabled={deletingId === t.id}
                  className="text-subtle-fg hover:text-destructive hover:bg-destructive-soft transition-colors rounded-md p-2 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Excluir ${t.description || 'transação'}`}
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && (
        <TransactionForm
          accounts={accounts}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title="Excluir transação"
          tone="danger"
          confirmLabel="Excluir"
          description={
            <>
              Deseja excluir{' '}
              <span className="text-foreground font-medium">
                “{confirmTarget.description || confirmTarget.categoryName || 'esta transação'}”
              </span>
              ? O impacto no saldo da conta{' '}
              <span className="text-foreground font-medium">
                {confirmTarget.accountName}
              </span>{' '}
              será revertido.
            </>
          }
          loading={deletingId === confirmTarget.id}
          onConfirm={() => handleDelete(confirmTarget.id)}
          onClose={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}

function TransactionForm({
  accounts,
  categories,
  onClose,
  onSaved,
}: {
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'EXPENSE',
    transactionDate: new Date().toISOString().slice(0, 10),
    accountId: '',
    toAccountId: '',
    categoryId: '',
    observation: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const expenseCats = useMemo(
    () => categories.filter((c) => c.type === 'EXPENSE'),
    [categories]
  );
  const incomeCats = useMemo(
    () => categories.filter((c) => c.type === 'INCOME'),
    [categories]
  );
  const catOptions = form.type === 'INCOME' ? incomeCats : expenseCats;

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

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
    if (form.type === 'TRANSFER') {
      if (!form.toAccountId) {
        setError('Selecione a conta de destino.');
        return;
      }
      if (form.accountId === form.toAccountId) {
        setError('As contas de origem e destino devem ser diferentes.');
        return;
      }
    }

    setSaving(true);
    try {
      if (form.type === 'TRANSFER') {
        await transferApi.create({
          fromAccountId: Number(form.accountId),
          toAccountId: Number(form.toAccountId),
          amount,
          description: form.description.trim() || undefined,
          transactionDate: form.transactionDate || undefined,
        });
      } else {
        await transactionApi.create({
          description: form.description.trim() || undefined,
          amount,
          type: form.type,
          transactionDate: form.transactionDate || undefined,
          accountId: Number(form.accountId),
          categoryId: form.categoryId ? Number(form.categoryId) : undefined,
          observation: form.observation.trim() || undefined,
        });
      }
      onSaved();
    } catch {
      setError('Não foi possível salvar a transação.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Nova transação"
      description="Informe os dados do lançamento."
      onClose={onClose}
      className="max-w-lg max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3 space-y-4">
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tipo de transação">
          {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => updateField('type', type)}
                  className={`h-9 rounded-md px-3 text-sm font-medium transition-colors ${
                    form.type === type
                      ? 'bg-surface-raised text-foreground border border-border-strong'
                      : 'border border-transparent bg-transparent text-muted-fg hover:bg-white/5 hover:text-foreground'
                  }`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        <Input
          label="Descrição"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder={form.type === 'TRANSFER' ? 'Transferência' : 'Ex.: Alimentação'}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Valor"
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => updateField('amount', e.target.value)}
            placeholder="0,00"
            required
          />
          <Input
            label="Data"
            type="date"
            value={form.transactionDate}
            onChange={(e) => updateField('transactionDate', e.target.value)}
            required
          />
        </div>
        <Select
          label={form.type === 'TRANSFER' ? 'Conta de origem' : 'Conta'}
          value={form.accountId}
          onChange={(e) => updateField('accountId', e.target.value)}
          required
        >
          <option value="">Selecione a conta</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        {form.type === 'TRANSFER' && (
          <Select
            label="Conta de destino"
            value={form.toAccountId}
            onChange={(e) => updateField('toAccountId', e.target.value)}
            required
          >
            <option value="">Selecione a conta</option>
            {accounts
              .filter((a) => a.id !== Number(form.accountId))
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </Select>
        )}
        {form.type !== 'TRANSFER' && (
          <Select
            label={form.type === 'INCOME' ? 'Categoria (receita)' : 'Categoria (despesa)'}
            value={form.categoryId}
            onChange={(e) => updateField('categoryId', e.target.value)}
          >
            <option value="">Sem categoria</option>
            {catOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        )}
        <Input
          label="Observação"
          value={form.observation}
          onChange={(e) => updateField('observation', e.target.value)}
          placeholder="Detalhes adicionais (opcional)"
        />

        {error && <FormError>{error}</FormError>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving} fullWidth>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
