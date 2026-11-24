import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Target,
  CheckCircle2,
  Wallet,
  ChevronRight,
  Goal as GoalIcon,
  Calculator,
  CalendarDays,
} from 'lucide-react';
import {
  Button,
  Input,
  EmptyState,
  PageHeader,
  LoadingRows,
  Modal,
  FormError,
  ErrorState,
  Badge,
} from '../components/ui';
import { ProgressBar } from '../components/ProgressBar';
import { goalApi } from '../services/api';
import type {
  GoalResponse,
  GoalSummaryResponse,
  GoalModality,
  CreateGoalRequest,
} from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import {
  GOAL_MODALITY_LABELS,
  GOAL_MODALITY_DESCRIPTIONS,
  todayInput,
} from '../utils/goals';

function getApiMessage(error: unknown, fallback: string): string {
  const message = (
    error as { response?: { data?: { message?: string } } }
  ).response?.data?.message;
  return message || fallback;
}

const MODALITY_ICONS: Record<GoalModality, typeof Target> = {
  TRADITIONAL: Target,
  INVESTMENT_CALCULATOR: Calculator,
  DEPOSIT_CALENDAR: CalendarDays,
};

export function Goals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [summary, setSummary] = useState<GoalSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  async function fetchData() {
    try {
      const [g, s] = await Promise.all([goalApi.list(), goalApi.summary()]);
      setGoals(g.data ?? []);
      setSummary(s.data);
    } catch (err) {
      setError(true);
      setErrorMessage(getApiMessage(err, 'Não foi possível carregar as metas.'));
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Metas financeiras"
        description="Crie objetivos, acompanhe o progresso e planeje seus depósitos."
        action={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" aria-hidden />
            Nova meta
          </Button>
        }
      />

      {loading ? (
        <LoadingRows rows={5} />
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
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 border-y border-border divide-y divide-border lg:divide-y-0 lg:divide-x">
              <Metric
                label="Metas ativas"
                value={String(summary.activeCount)}
                icon={<Target className="w-4 h-4" />}
                tone="accent"
              />
              <Metric
                label="Concluídas"
                value={String(summary.completedCount)}
                icon={<CheckCircle2 className="w-4 h-4" />}
                tone="success"
              />
              <Metric
                label="Total acumulado"
                value={formatCurrency(summary.totalSaved)}
                icon={<Wallet className="w-4 h-4" />}
                tone="neutral"
                mono
              />
              <Metric
                label="Objetivo das ativas"
                value={formatCurrency(summary.totalTargetActive)}
                icon={<GoalIcon className="w-4 h-4" />}
                tone="neutral"
                mono
              />
            </div>
          )}

          {goals.length === 0 ? (
            <div className="border-t border-border">
              <EmptyState
                title="Nenhuma meta ainda"
                description="Crie sua primeira meta financeira para começar a guardar dinheiro com um objetivo claro."
                action={
                  <Button onClick={() => setShowCreate(true)}>
                    <Plus className="w-4 h-4" aria-hidden />
                    Criar meta
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onOpen={() => navigate(`/goals/${goal.id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showCreate && (
        <CreateGoalModal
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            setShowCreate(false);
            navigate(`/goals/${id}`);
          }}
        />
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
  tone,
  mono = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: 'accent' | 'success' | 'neutral';
  mono?: boolean;
}) {
  const tones = {
    accent: 'text-accent',
    success: 'text-success',
    neutral: 'text-subtle-fg',
  };
  return (
    <div className="px-0 py-5 sm:px-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-subtle-fg">{label}</span>
        <span className={tones[tone]}>{icon}</span>
      </div>
      <p
        className={`mt-2 ${
          mono ? 'font-mono text-lg md:text-xl tracking-[-0.02em]' : 'text-2xl md:text-3xl'
        } font-medium tabular-nums truncate text-foreground`}
      >
        {value}
      </p>
    </div>
  );
}

function GoalCard({ goal, onOpen }: { goal: GoalResponse; onOpen: () => void }) {
  const Icon = MODALITY_ICONS[goal.modality];
  return (
    <button
      onClick={onOpen}
      className="group text-left bg-surface border border-border rounded-lg p-5 transition-colors hover:border-border-strong focus-ring"
      aria-label={`Abrir meta ${goal.name}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md bg-surface-raised text-accent">
            <Icon className="w-[18px] h-[18px]" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {goal.name}
            </p>
            <p className="mt-0.5 text-xs text-muted-fg truncate">
              {GOAL_MODALITY_LABELS[goal.modality]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {goal.completed ? (
            <Badge tone="success">Concluída</Badge>
          ) : goal.status === 'ARCHIVED' ? (
            <Badge tone="neutral">Arquivada</Badge>
          ) : null}
          <ChevronRight
            className="w-4 h-4 text-subtle-fg group-hover:text-foreground transition-colors"
            aria-hidden
          />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xl font-medium tabular-nums text-foreground">
            {formatCurrency(goal.currentAmount)}
          </p>
          <p className="mt-0.5 text-xs text-muted-fg">
            de {formatCurrency(goal.targetAmount)}
          </p>
        </div>
        <span
          className={`font-mono text-sm font-medium tabular-nums ${
            goal.completed ? 'text-success' : 'text-accent'
          }`}
        >
          {goal.percentage.toFixed(0)}%
        </span>
      </div>

      <div className="mt-3">
        <ProgressBar
          value={goal.percentage}
          completed={goal.completed}
          label={`Progresso da meta ${goal.name}`}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-subtle-fg">
        <span>
          {goal.completed
            ? 'Objetivo alcançado'
            : `Faltam ${formatCurrency(goal.remainingAmount)}`}
        </span>
        {goal.targetDate && <span>até {formatDate(goal.targetDate)}</span>}
      </div>
    </button>
  );
}

function CreateGoalModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: number) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    targetAmount: '',
    initialAmount: '',
    startDate: todayInput(),
    targetDate: '',
    modality: 'TRADITIONAL' as GoalModality,
    color: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const target = parseFloat(form.targetAmount.replace(',', '.'));
    const initial = form.initialAmount
      ? parseFloat(form.initialAmount.replace(',', '.'))
      : 0;

    if (!form.name.trim()) {
      setError('Informe o nome da meta.');
      return;
    }
    if (!target || target <= 0) {
      setError('Informe um valor desejado válido.');
      return;
    }
    if (initial < 0 || Number.isNaN(initial)) {
      setError('O valor inicial não pode ser negativo.');
      return;
    }
    if (initial > target) {
      setError('O valor inicial não pode ser maior que o valor desejado.');
      return;
    }
    if (form.targetDate && form.targetDate < form.startDate) {
      setError('A data limite não pode ser anterior à data de início.');
      return;
    }
    const payload: CreateGoalRequest = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      targetAmount: target,
      initialAmount: initial,
      startDate: form.startDate,
      targetDate: form.targetDate || undefined,
      modality: form.modality,
      color: form.color || undefined,
    };

    setSaving(true);
    try {
      const res = await goalApi.create(payload);
      onCreated(res.data.id);
    } catch (err) {
      setError(getApiMessage(err, 'Não foi possível criar a meta.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Nova meta financeira"
      description="Defina o objetivo e escolha como acompanhá-lo."
      onClose={onClose}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3 space-y-4">
        <Input
          label="Nome"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Ex.: Comprar um computador"
          required
        />

        <Input
          label="Descrição (opcional)"
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          placeholder="Detalhes sobre o objetivo"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Valor desejado"
            type="number"
            step="0.01"
            min="0"
            value={form.targetAmount}
            onChange={(e) =>
              setForm((p) => ({ ...p, targetAmount: e.target.value }))
            }
            placeholder="0,00"
            required
          />
          <Input
            label="Valor inicial (opcional)"
            type="number"
            step="0.01"
            min="0"
            value={form.initialAmount}
            onChange={(e) =>
              setForm((p) => ({ ...p, initialAmount: e.target.value }))
            }
            placeholder="0,00"
            hint="Quanto você já guardou"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Data de início"
            type="date"
            value={form.startDate}
            onChange={(e) =>
              setForm((p) => ({ ...p, startDate: e.target.value }))
            }
            required
          />
          <Input
            label="Data limite (opcional)"
            type="date"
            value={form.targetDate}
            min={form.startDate}
            onChange={(e) =>
              setForm((p) => ({ ...p, targetDate: e.target.value }))
            }
            hint={
              form.modality === 'DEPOSIT_CALENDAR'
                ? 'Opcional nos quadradinhos'
                : undefined
            }
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-foreground mb-1.5">
            Modalidade de acompanhamento
          </span>
          <div className="space-y-2" role="radiogroup" aria-label="Modalidade">
            {(Object.keys(GOAL_MODALITY_LABELS) as GoalModality[]).map((m) => {
              const Icon = MODALITY_ICONS[m];
              const active = form.modality === m;
              return (
                <button
                  type="button"
                  key={m}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setForm((p) => ({ ...p, modality: m }))}
                  className={`w-full flex items-start gap-3 rounded-md border p-3 text-left transition-colors focus-ring ${
                    active
                      ? 'border-accent bg-accent-soft/40'
                      : 'border-border hover:border-border-strong'
                  }`}
                >
                  <span
                    className={`mt-0.5 shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md ${
                      active
                        ? 'bg-accent-soft text-accent'
                        : 'bg-surface-raised text-subtle-fg'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      {GOAL_MODALITY_LABELS[m]}
                    </span>
                    <span className="block text-xs text-muted-fg">
                      {GOAL_MODALITY_DESCRIPTIONS[m]}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error && <FormError>{error}</FormError>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving} fullWidth>
            Criar meta
          </Button>
        </div>
      </form>
    </Modal>
  );
}