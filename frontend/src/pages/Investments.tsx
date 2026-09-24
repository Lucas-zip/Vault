import { useMemo, useState, type FormEvent } from 'react';
import { Plus, TrendingUp, Trash2, WalletCards } from 'lucide-react';
import {
  Button,
  Input,
  EmptyState,
  PageHeader,
  Modal,
  FormError,
} from '../components/ui';
import {
  calculateMonthlyYield,
  calculateTotalInvested,
  calculateTotalMonthlyYield,
  getInvestments,
  saveInvestments,
  type Investment,
} from '../utils/investments';
import { formatCurrency } from '../utils/format';

export function Investments() {
  const [investments, setInvestments] = useState<Investment[]>(() =>
    getInvestments()
  );
  const [showCreate, setShowCreate] = useState(false);
  const [investTarget, setInvestTarget] = useState<Investment | null>(null);

  function persist(next: Investment[]) {
    setInvestments(next);
    saveInvestments(next);
  }

  function handleCreate(name: string, amount: number, monthlyRate: number) {
    const investment: Investment = {
      id: crypto.randomUUID(),
      name,
      amount,
      monthlyRate,
      createdAt: new Date().toISOString(),
    };
    persist([...investments, investment]);
  }

  function handleInvest(id: string, amount: number) {
    persist(
      investments.map((investment) =>
        investment.id === id
          ? { ...investment, amount: investment.amount + amount }
          : investment
      )
    );
  }

  function handleDelete(id: string) {
    const investment = investments.find((item) => item.id === id);
    if (!investment) return;
    if (!confirm(`Excluir o investimento ${investment.name}?`)) return;
    persist(investments.filter((item) => item.id !== id));
  }

  const totalInvested = useMemo(
    () => calculateTotalInvested(investments),
    [investments]
  );
  const totalYield = useMemo(
    () => calculateTotalMonthlyYield(investments),
    [investments]
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Investimentos"
        description="Acompanhe seus aportes e o rendimento mensal estimado."
        action={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" aria-hidden />
            Novo investimento
          </Button>
        }
      />

      <section className="border-b border-border pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-subtle-fg">Total investido</p>
            <p className="mt-3 font-mono text-4xl md:text-5xl font-medium tracking-[-0.03em] tabular-nums text-foreground">
              {formatCurrency(totalInvested)}
            </p>
          </div>
          <div>
            <p className="text-sm text-subtle-fg">Rendimento mensal estimado</p>
            <p className="mt-2 font-mono text-2xl font-medium tabular-nums text-success">
              + {formatCurrency(totalYield)}
            </p>
          </div>
        </div>
      </section>

      {investments.length === 0 ? (
        <div className="border-t border-border">
          <EmptyState
            title="Nenhum investimento"
            description="Cadastre um investimento para acompanhar o rendimento mensal."
            action={
              <Button variant="secondary" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4" aria-hidden />
                Novo investimento
              </Button>
            }
          />
        </div>
      ) : (
        <div className="border-t border-border divide-y divide-border">
          {investments.map((investment) => {
            const yieldAmount = calculateMonthlyYield(investment);
            return (
              <div
                key={investment.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 py-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="p-2 rounded-md bg-success-soft text-success">
                    <TrendingUp className="w-4 h-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {investment.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-fg">
                      {investment.monthlyRate}% ao mês
                    </p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 gap-3 sm:max-w-xs">
                  <div>
                    <p className="text-xs text-subtle-fg">Investido</p>
                    <p className="mt-1 font-mono text-sm font-medium tabular-nums text-foreground">
                      {formatCurrency(investment.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle-fg">Rende/mês</p>
                    <p className="mt-1 font-mono text-sm font-medium tabular-nums text-success">
                      + {formatCurrency(yieldAmount)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    onClick={() => setInvestTarget(investment)}
                  >
                    <WalletCards className="w-4 h-4" aria-hidden />
                    Investir
                  </Button>
                  <button
                    onClick={() => handleDelete(investment.id)}
                    className="text-subtle-fg hover:text-destructive hover:bg-destructive-soft transition-colors rounded-md p-2 focus-ring"
                    aria-label={`Excluir ${investment.name}`}
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateInvestmentModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {investTarget && (
        <InvestModal
          investment={investTarget}
          onClose={() => setInvestTarget(null)}
          onInvest={handleInvest}
        />
      )}
    </div>
  );
}

function CreateInvestmentModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, amount: number, monthlyRate: number) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    amount: '',
    monthlyRate: '',
  });
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const amount = parseFloat(form.amount.replace(',', '.'));
    const monthlyRate = parseFloat(form.monthlyRate.replace(',', '.'));
    if (!form.name.trim()) {
      setError('Informe o nome do investimento.');
      return;
    }
    if (!amount || amount <= 0) {
      setError('Informe um valor inicial válido.');
      return;
    }
    if (monthlyRate < 0 || Number.isNaN(monthlyRate)) {
      setError('Informe uma taxa mensal válida.');
      return;
    }

    onCreate(form.name.trim(), amount, monthlyRate);
    onClose();
  }

  return (
    <Modal
      title="Novo investimento"
      description="Cadastre o valor inicial e a rentabilidade mensal."
      onClose={onClose}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3 space-y-4">
        <Input
          label="Nome"
          value={form.name}
          onChange={(e) =>
            setForm((p) => ({ ...p, name: e.target.value }))
          }
          placeholder="Ex.: CDB, Tesouro, Ações"
          required
        />
        <Input
          label="Valor inicial"
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
          label="Rendimento mensal (%)"
          type="number"
          step="0.01"
          min="0"
          value={form.monthlyRate}
          onChange={(e) =>
            setForm((p) => ({ ...p, monthlyRate: e.target.value }))
          }
          placeholder="Ex.: 1,2"
          required
        />

        {error && <FormError>{error}</FormError>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function InvestModal({
  investment,
  onClose,
  onInvest,
}: {
  investment: Investment;
  onClose: () => void;
  onInvest: (id: string, amount: number) => void;
}) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const value = parseFloat(amount.replace(',', '.'));
    if (!value || value <= 0) {
      setError('Informe um valor válido para investir.');
      return;
    }
    onInvest(investment.id, value);
    onClose();
  }

  return (
    <Modal
      title={`Investir em ${investment.name}`}
      description={`Valor atual investido: ${formatCurrency(investment.amount)}`}
      onClose={onClose}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3 space-y-4">
        <Input
          label="Valor do novo aporte"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0,00"
          required
        />

        {error && <FormError>{error}</FormError>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth>
            Investir
          </Button>
        </div>
      </form>
    </Modal>
  );
}
