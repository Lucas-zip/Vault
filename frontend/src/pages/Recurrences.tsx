import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Play, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

  async function handleExecute(id: number) {
    try {
      await recurrenceApi.execute(id);
      load();
    } catch {
      // interceptador
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Excluir esta recorrência?')) return;
    try {
      await recurrenceApi.delete(id);
      load();
    } catch {
      // interceptador
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
                      onClick={() => handleExecute(r.id)}
                      className="text-subtle-fg hover:text-success hover:bg-success-soft transition-colors rounded-md p-2 focus-ring"
                      title="Executar agora"
                      aria-label={`Executar agora ${r.description || 'recorrência'}`}
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-subtle-fg hover:text-destructive hover:bg-destructive-soft transition-colors rounded-md p-2 focus-ring"
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
    </div>
  );
}

function RecurrenceForm({
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
    frequency: 'MONTHLY',
    startDate: new Date().toISOString().slice(0, 10),
    accountId: '',
    categoryId: '',
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
    setSaving(true);
    try {
      await recurrenceApi.create({
        description: form.description.trim() || undefined,
        amount,
        type: form.type,
        frequency: form.frequency,
        startDate: form.startDate || undefined,
        accountId: Number(form.accountId),
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      });
      onSaved();
    } catch {
      setError('Não foi possível criar a recorrência.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Nova recorrência"
      description="Configure um lançamento que se repete automaticamente."
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
