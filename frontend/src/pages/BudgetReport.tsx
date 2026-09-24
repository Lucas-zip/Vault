import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowDownRight } from 'lucide-react';
import {
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  LoadingRows,
  Section,
} from '../components/ui';
import { categoryApi, transactionApi } from '../services/api';
import type { CategoryResponse, TransactionResponse } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

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

function getApiMessage(error: unknown): string {
  const message = (
    error as { response?: { data?: { message?: string } } }
  ).response?.data?.message;
  return message || 'Não foi possível carregar o relatório.';
}

export function BudgetReport() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function fetchData() {
    try {
      const [c, t] = await Promise.all([
        categoryApi.list(),
        transactionApi.list({ page: '0', size: '500' }),
      ]);
      const allCategories: CategoryResponse[] = c.data ?? [];
      setCategories(allCategories.filter((item) => item.type === 'EXPENSE'));
      setTransactions(t.data?.content ?? []);
    } catch (err) {
      setError(true);
      setErrorMessage(getApiMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchData();
  }, []);

  const monthExpenses = useMemo(() => {
    const { startDate, endDate } = currentMonthRange();
    return transactions.filter(
      (transaction) =>
        transaction.type === 'EXPENSE' &&
        transaction.transactionDate &&
        transaction.transactionDate >= startDate &&
        transaction.transactionDate <= endDate
    );
  }, [transactions]);

  const total = useMemo(
    () => monthExpenses.reduce((sum, item) => sum + item.amount, 0),
    [monthExpenses]
  );

  const categoryTotals = useMemo(() => {
    return categories
      .map((category) => {
        const categoryTransactions = monthExpenses.filter(
          (transaction) => transaction.categoryId === category.id
        );
        return {
          category,
          amount: categoryTransactions.reduce(
            (sum, item) => sum + item.amount,
            0
          ),
          count: categoryTransactions.length,
        };
      })
      .filter((item) => item.amount > 0 || item.count > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [categories, monthExpenses]);

  const topCategory = categoryTotals[0];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Relatório geral de gastos" />
        <LoadingRows rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <Section>
        <ErrorState
          description={errorMessage}
          action={
            <Button variant="secondary" onClick={() => void fetchData()}>
              Tentar novamente
            </Button>
          }
        />
      </Section>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Relatório geral de gastos"
        description="Visão consolidada de todos os orçamentos do mês."
        action={
          <Button variant="secondary" onClick={() => navigate('/budgets')}>
            <ChevronLeft className="w-4 h-4" aria-hidden />
            Voltar
          </Button>
        }
      />

      <section className="border-b border-border pb-8">
        <p className="text-sm text-subtle-fg">Total geral do mês</p>
        <p className="mt-3 font-mono text-4xl md:text-5xl font-medium tracking-[-0.03em] tabular-nums text-foreground">
          {formatCurrency(total)}
        </p>
        <p className="mt-3 text-sm text-muted-fg">
          {monthExpenses.length}{' '}
          {monthExpenses.length === 1 ? 'lançamento' : 'lançamentos'}
          {topCategory
            ? ` · maior gasto: ${topCategory.category.name}`
            : ''}
        </p>
      </section>

      <Section title="Resumo por categoria" description="Total gasto em cada categoria">
        {categoryTotals.length === 0 ? (
          <EmptyState
            title="Nenhum gasto neste mês"
            description="Registre seus gastos na tela de orçamentos para vê-los aqui."
          />
        ) : (
          <div className="divide-y divide-border">
            {categoryTotals.map(({ category, amount, count }) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {category.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-fg">
                    {count} {count === 1 ? 'lançamento' : 'lançamentos'}
                  </p>
                </div>
                <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                  {formatCurrency(amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Todos os lançamentos" description="Detalhamento completo do mês">
        {monthExpenses.length === 0 ? (
          <EmptyState
            title="Nenhum lançamento encontrado"
            description="Seus gastos registrados neste mês aparecerão aqui."
          />
        ) : (
          <div className="divide-y divide-border">
            {monthExpenses
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.transactionDate ?? 0).getTime() -
                  new Date(a.transactionDate ?? 0).getTime()
              )
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 py-3.5"
                >
                  <span className="p-2 rounded-md bg-destructive-soft text-destructive">
                    <ArrowDownRight className="w-4 h-4" aria-hidden />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {transaction.description || 'Sem descrição'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-fg truncate">
                      {transaction.categoryName || 'Sem categoria'}
                      {transaction.transactionDate
                        ? ` · ${formatDate(transaction.transactionDate)}`
                        : ''}
                      {transaction.accountName
                        ? ` · ${transaction.accountName}`
                        : ''}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </Section>
    </div>
  );
}
