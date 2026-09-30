import { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import {
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Section,
} from '../components/ui';
import { dashboardApi, transactionApi } from '../services/api';
import type {
  DashboardSummaryResponse,
  DashboardAccount,
  TransactionResponse,
} from '../types';
import { formatCurrency, ACCOUNT_TYPE_LABELS } from '../utils/format';
import {
  calculateTotalMonthlyYield,
  getInvestments,
} from '../utils/investments';

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
  return message || 'Não foi possível carregar os dados da Visão Geral.';
}

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [accounts, setAccounts] = useState<DashboardAccount[]>([]);
  const [topExpenses, setTopExpenses] = useState<TransactionResponse[]>([]);
  const [monthTransactions, setMonthTransactions] = useState<
    TransactionResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function fetchData() {
    try {
      const { startDate, endDate } = currentMonthRange();
      const [s, a, t] = await Promise.all([
        dashboardApi.summary(),
        dashboardApi.accounts(),
        transactionApi.list({ page: '0', size: '100' }),
      ]);
      setSummary(s.data);
      setAccounts(a.data);
      const transactions: TransactionResponse[] = t.data?.content ?? [];
      const inCurrentMonth = transactions.filter(
        (item) =>
          item.transactionDate &&
          item.transactionDate >= startDate &&
          item.transactionDate <= endDate
      );
      setMonthTransactions(inCurrentMonth);
      setTopExpenses(
        inCurrentMonth
          .filter((item) => item.type === 'EXPENSE')
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5)
      );
    } catch (err) {
      setError(true);
      setErrorMessage(getApiMessage(err));
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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-40 rounded-md bg-surface-muted animate-pulse" />
        <div className="space-y-3">
          <div className="h-7 w-28 rounded-md bg-surface-muted animate-pulse" />
          <div className="h-16 w-64 rounded-md bg-surface-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-md bg-surface-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Section>
        <ErrorState
          description={errorMessage}
          action={
            <Button variant="secondary" onClick={load}>
              Tentar novamente
            </Button>
          }
        />
      </Section>
    );
  }

  const investments = getInvestments();
  const investmentYield = calculateTotalMonthlyYield(investments);
  const monthIncome = (summary?.monthIncome ?? 0) + investmentYield;
  const monthExpense = summary?.monthExpense ?? 0;
  const monthResult = monthIncome - monthExpense;
  const transactionCount =
    monthTransactions.length || summary?.transactionCount || 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Visão Geral"
        description="Acompanhe sua situação financeira do mês."
      />

      {/* ===== Situação principal ===== */}
      <section className="pb-8">
        <p className="text-sm text-subtle-fg">Saldo total</p>
        <p className="mt-3 font-mono text-4xl md:text-5xl font-medium tracking-[-0.03em] tabular-nums text-foreground">
          {formatCurrency(summary?.totalBalance ?? 0)}
        </p>
        <p className="mt-3 text-sm text-subtle-fg">
          {transactionCount}{' '}
          {transactionCount === 1
            ? 'transação registrada no mês'
            : 'transações registradas no mês'}
        </p>
      </section>

      {/* ===== Indicadores mensais ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-y border-border divide-y sm:divide-y-0 sm:divide-x divide-border">
        <Metric
          label="Receitas do mês"
          value={monthIncome}
          icon={<ArrowUpRight className="w-4 h-4" />}
          tone="positive"
        />
        <Metric
          label="Despesas do mês"
          value={summary?.monthExpense ?? 0}
          icon={<ArrowDownRight className="w-4 h-4" />}
          tone="negative"
        />
        <Metric
          label="Resultado do mês"
          value={monthResult}
          icon={<TrendingUp className="w-4 h-4" />}
          tone={monthResult >= 0 ? 'positive' : 'negative'}
        />
      </div>

      {investmentYield > 0 && (
        <div className="border-b border-border py-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-fg">Rendimento estimado de investimentos</span>
            <span className="font-mono font-medium tabular-nums text-success">
              + {formatCurrency(investmentYield)}
            </span>
          </div>
        </div>
      )}

      {/* ===== Atenções ===== */}
      {(summary?.pendingCount || summary?.overdueCount) ? (
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border py-5 text-sm">
          {summary?.pendingCount ? (
            <div className="flex items-center gap-2 text-muted-fg">
              <Clock className="w-4 h-4 text-warning" aria-hidden />
              <span>
                <strong className="text-foreground">{summary.pendingCount}</strong>{' '}
                pagamento(s) pendente(s)
              </span>
            </div>
          ) : null}
          {summary?.overdueCount ? (
            <div className="flex items-center gap-2 text-muted-fg">
              <AlertTriangle className="w-4 h-4 text-destructive" aria-hidden />
              <span>
                <strong className="text-destructive">{summary.overdueCount}</strong>{' '}
                pagamento(s) em atraso
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ===== Contas e maiores despesas ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
        <Section title="Contas" description="Saldo atual por conta">
          {accounts.length === 0 ? (
            <EmptyState
              title="Nenhuma conta"
              description="Crie uma conta para começar a registrar transações."
            />
          ) : (
            <div className="divide-y divide-border">
              {accounts.map((acc) => (
                <div
                  key={acc.accountId}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {acc.accountName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-fg">
                      {ACCOUNT_TYPE_LABELS[acc.accountType] ?? acc.accountType}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-sm font-medium tabular-nums ${
                      acc.balance >= 0 ? 'text-foreground' : 'text-destructive'
                    }`}
                  >
                    {formatCurrency(acc.balance)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Maiores despesas" description="Distribuição por categoria">
          {topExpenses.length === 0 ? (
            <EmptyState
              title="Sem despesas registradas"
              description="Suas maiores despesas aparecerão aqui."
            />
          ) : (
            <div className="space-y-4">
              {topExpenses.map((cat, i) => {
                const max = topExpenses[0]?.amount ?? 1;
                const width = Math.max(8, (cat.amount / max) * 100);
                return (
                  <div key={`${cat.categoryName}-${i}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-muted-fg">{cat.categoryName}</span>
                      <span className="font-mono text-sm text-foreground tabular-nums">
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-surface-strong overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: 'positive' | 'negative';
}) {
  const positive = tone === 'positive';
  const valueTone =
    tone === 'positive'
      ? value >= 0
        ? 'text-success'
        : 'text-destructive'
      : 'text-destructive';

  return (
    <div className="px-0 py-5 sm:px-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-subtle-fg">{label}</span>
        <span
          className={
            positive ? 'text-success' : 'text-destructive'
          }
        >
          {icon}
        </span>
      </div>
      <p className={`mt-2 font-mono text-xl md:text-2xl font-medium tracking-[-0.02em] tabular-nums truncate ${valueTone}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
