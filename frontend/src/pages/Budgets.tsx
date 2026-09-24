import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, ArrowDownRight, ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { categoryApi, accountApi, transactionApi } from '../services/api';
import type {
  CategoryResponse,
  AccountResponse,
  TransactionResponse,
} from '../types';
import { formatCurrency } from '../utils/format';

function currentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    startDate: `${year}-${pad(month)}-01`,
    endDate: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
}

function currentDateInput() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getApiMessage(error: unknown, fallback: string): string {
  const message = (
    error as { response?: { data?: { message?: string } } }
  ).response?.data?.message;
  return message || fallback;
}

export function Budgets() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [initialCategory, setInitialCategory] =
    useState<CategoryResponse | null>(null);

  async function fetchData() {
    try {
      const [c, a, t] = await Promise.all([
        categoryApi.list(),
        accountApi.list(),
        transactionApi.list({ page: '0', size: '200' }),
      ]);

      const allCategories: CategoryResponse[] = c.data ?? [];
      setCategories(allCategories.filter((item) => item.type === 'EXPENSE'));
      setAccounts(a.data?.content ?? []);
      setTransactions(t.data?.content ?? []);
    } catch (err) {
      setError(true);
      setErrorMessage(getApiMessage(err, 'Não foi possível carregar os gastos.'));
    } finally {
      setLoading(false);
    }
  }

  function load() {
    setLoading(true);
    setError(false);
    setErrorMessage('');
    void fetchData();
  }

  useEffect(() => {
    void fetchData();
  }, []);

  async function handleDeleteCategory(category: CategoryResponse) {
    if (!confirm(`Excluir a categoria ${category.name}?`)) return;
    try {
      await categoryApi.delete(category.id);
      load();
    } catch (err) {
      alert(
        getApiMessage(
          err,
          'Não foi possível excluir. Essa categoria pode estar em uso.'
        )
      );
    }
  }

  const totals = useMemo(() => {
    const { startDate, endDate } = currentMonthRange();
    return categories
      .map((category) => {
        const categoryTransactions = transactions.filter(
          (transaction) =>
            transaction.type === 'EXPENSE' &&
            transaction.categoryId === category.id &&
            transaction.transactionDate &&
            transaction.transactionDate >= startDate &&
            transaction.transactionDate <= endDate
        );
        return {
          category,
          amount: categoryTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
          ),
          count: categoryTransactions.length,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [categories, transactions]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamentos"
        description="Acompanhe quanto você já gastou em cada categoria."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate('/budgets/report')}
            >
              Relatório geral
            </Button>
            <Button
              onClick={() => {
                setInitialCategory(null);
                setShowForm(true);
              }}
            >
              <Plus className="w-4 h-4" aria-hidden />
              Registrar gasto
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="border-t border-border pt-5">
          <LoadingRows rows={4} />
        </div>
      ) : error ? (
        <div className="border-t border-border">
          <ErrorState
            description={errorMessage}
            action={
              <Button variant="secondary" onClick={load}>
                Tentar novamente
              </Button>
            }
          />
        </div>
      ) : categories.length === 0 ? (
        <div className="border-t border-border">
          <EmptyState
            title="Nenhuma categoria de despesa"
            description="Crie uma categoria de despesa para começar a registrar seus gastos."
            action={
              <Button variant="secondary" onClick={() => navigate('/categories')}>
                Criar categoria
              </Button>
            }
          />
        </div>
      ) : (
        <div className="border-t border-border divide-y divide-border">
          {totals.map(({ category, amount, count }) => (
            <div
              key={category.id}
              className="flex items-center gap-3 py-3.5 transition-colors hover:bg-white/[0.03]"
            >
              <span className="p-2 rounded-md bg-destructive-soft text-destructive">
                <ArrowDownRight className="w-4 h-4" aria-hidden />
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {category.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-fg">
                  {count === 0
                    ? 'Nenhum gasto registrado neste mês'
                    : `${count} ${count === 1 ? 'gasto' : 'gastos'} neste mês`}
                </p>
              </div>

              <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                {formatCurrency(amount)}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="text-subtle-fg hover:text-destructive hover:bg-destructive-soft transition-colors rounded-md p-2 focus-ring"
                  aria-label={`Excluir categoria ${category.name}`}
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(`/budgets/${category.id}`)}
                  className="text-subtle-fg hover:text-accent hover:bg-accent-soft transition-colors rounded-md p-2 focus-ring"
                  aria-label={`Ver relatório de ${category.name}`}
                  title="Ver relatório"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setInitialCategory(category);
                    setShowForm(true);
                  }}
                  className="text-subtle-fg hover:text-success hover:bg-success-soft transition-colors rounded-md p-2 focus-ring"
                  aria-label={`Registrar gasto em ${category.name}`}
                  title="Registrar gasto"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CategoryExpenseForm
          categories={categories}
          accounts={accounts}
          initialCategory={initialCategory}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            setInitialCategory(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function CategoryExpenseForm({
  categories,
  accounts,
  initialCategory,
  onClose,
  onSaved,
}: {
  categories: CategoryResponse[];
  accounts: AccountResponse[];
  initialCategory: CategoryResponse | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    categoryId: initialCategory ? String(initialCategory.id) : '',
    description: '',
    amount: '',
    transactionDate: currentDateInput(),
    accountId: accounts.length === 1 ? String(accounts[0].id) : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedCategory =
    categories.find((category) => category.id === Number(form.categoryId)) ??
    initialCategory;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const amount = parseFloat(form.amount.replace(',', '.'));
    if (!form.categoryId) {
      setError('Selecione uma categoria.');
      return;
    }
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
      await transactionApi.create({
        description:
          form.description.trim() ||
          `Gasto em ${selectedCategory?.name ?? 'categoria'}`,
        amount,
        type: 'EXPENSE',
        transactionDate: form.transactionDate || undefined,
        accountId: Number(form.accountId),
        categoryId: Number(form.categoryId),
      });
      onSaved();
    } catch (err) {
      setError(getApiMessage(err, 'Não foi possível registrar o gasto.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={
        initialCategory
          ? `Registrar gasto em ${initialCategory.name}`
          : 'Registrar gasto por categoria'
      }
      description="O valor será somado aos gastos da categoria no mês atual."
      onClose={onClose}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3 space-y-4">
        <Select
          label="Categoria"
          value={form.categoryId}
          onChange={(e) =>
            setForm((p) => ({ ...p, categoryId: e.target.value }))
          }
          disabled={Boolean(initialCategory)}
          required
        >
          <option value="">Selecione a categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <Input
          label="Descrição"
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          placeholder="Descrição da despesa"
        />

        <Input
          label="Valor gasto"
          type="number"
          step="0.01"
          min="0"
          value={form.amount}
          onChange={(e) =>
            setForm((p) => ({ ...p, amount: e.target.value }))
          }
          placeholder="0,00"
          required
        />

        <Input
          label="Data"
          type="date"
          value={form.transactionDate}
          onChange={(e) =>
            setForm((p) => ({ ...p, transactionDate: e.target.value }))
          }
          required
        />

        <Select
          label="Conta"
          value={form.accountId}
          onChange={(e) =>
            setForm((p) => ({ ...p, accountId: e.target.value }))
          }
          required
        >
          <option value="">Selecione a conta</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>

        {accounts.length === 0 && (
          <p className="text-xs text-muted-fg">
            Você precisa criar uma conta antes de registrar gastos.
          </p>
        )}

        {error && <FormError>{error}</FormError>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving} fullWidth>
            Salvar gasto
          </Button>
        </div>
      </form>
    </Modal>
  );
}
