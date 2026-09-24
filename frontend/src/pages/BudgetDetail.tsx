import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowDownRight, ChevronLeft } from 'lucide-react';
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

function getApiMessage(error: unknown): string {
  const message = (
    error as { response?: { data?: { message?: string } } }
  ).response?.data?.message;
  return message || 'Não foi possível carregar o relatório.';
}

export function BudgetDetail() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [category, setCategory] = useState<CategoryResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function fetchData() {
    try {
      const id = Number(categoryId);
      const [c, t] = await Promise.all([
        categoryApi.list(),
        transactionApi.list({ page: '0', size: '500' }),
      ]);

      const categories: CategoryResponse[] = c.data ?? [];
      setCategory(
        categories.find((item) => item.id === id && item.type === 'EXPENSE') ??
          null
      );

      const allTransactions: TransactionResponse[] = t.data?.content ?? [];
      setTransactions(
        allTransactions
          .filter(
            (transaction) =>
              transaction.type === 'EXPENSE' &&
              transaction.categoryId === id
          )
          .sort(
            (a, b) =>
              new Date(b.transactionDate ?? 0).getTime() -
              new Date(a.transactionDate ?? 0).getTime()
          )
      );
    } catch (err) {
      setError(true);
      setErrorMessage(getApiMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchData();
  }, [categoryId]);

  const total = useMemo(
    () => transactions.reduce((sum, item) => sum + item.amount, 0),
    [transactions]
  );

  const average =
    transactions.length > 0 ? total / transactions.length : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Relatório de gastos" />
        <LoadingRows rows={5} />
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

  if (!category) {
    return (
      <Section>
        <EmptyState
          title="Categoria não encontrada"
          description="A categoria que você procura pode ter sido excluída."
          action={
            <Button variant="secondary" onClick={() => navigate('/budgets')}>
              Voltar para orçamentos
            </Button>
          }
        />
      </Section>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Gastos · ${category.name}`}
        description="Relatório detalhado dos lançamentos desta categoria."
        action={
          <Button variant="secondary" onClick={() => navigate('/budgets')}>
            <ChevronLeft className="w-4 h-4" aria-hidden />
            Voltar
          </Button>
        }
      />

      <section className="border-b border-border pb-8">
        <p className="text-sm text-subtle-fg">Total gasto</p>
        <p className="mt-3 font-mono text-4xl md:text-5xl font-medium tracking-[-0.03em] tabular-nums text-foreground">
          {formatCurrency(total)}
        </p>
        <p className="mt-3 text-sm text-muted-fg">
          {transactions.length}{' '}
          {transactions.length === 1 ? 'lançamento' : 'lançamentos'}
          {transactions.length > 0 &&
            ` · média de ${formatCurrency(average)}`}
        </p>
      </section>

      <Section title="Lançamentos" description="Tudo o que foi registrado nesta categoria">
        {transactions.length === 0 ? (
          <EmptyState
            title="Nenhum gasto registrado"
            description="Quando você registrar um gasto nesta categoria, ele aparecerá aqui."
          />
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-4 py-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="p-2 rounded-md bg-destructive-soft text-destructive">
                    <ArrowDownRight className="w-4 h-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {transaction.description || 'Sem descrição'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-fg">
                      {transaction.transactionDate
                        ? formatDate(transaction.transactionDate)
                        : 'Data não informada'}
                      {transaction.accountName
                        ? ` · ${transaction.accountName}`
                        : ''}
                    </p>
                  </div>
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
