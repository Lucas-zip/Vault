import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Archive,
  Trash2,
  Target,
  Calculator,
  Grid3x3,
  CheckCircle2,
} from 'lucide-react';
import {
  Button,
  ErrorState,
  LoadingRows,
  Modal,
  Input,
  Select,
  FormError,
  ConfirmDialog,
  Badge,
  PageHeader,
} from '../components/ui';
import { ProgressBar } from '../components/ProgressBar';
import { TraditionalPanel } from '../components/goals/TraditionalPanel';
import { CalculatorPanel } from '../components/goals/CalculatorPanel';
import { CalendarPanel } from '../components/goals/CalendarPanel';
import { goalApi } from '../services/api';
import type {
  GoalDetailResponse,
  GoalModality,
  UpdateGoalRequest,
} from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import {
  GOAL_MODALITY_LABELS,
  toDateInput,
} from '../utils/goals';

function getApiMessage(error: unknown, fallback: string): string {
  const message = (
    error as { response?: { data?: { message?: string } } }
  ).response?.data?.message;
  return message || fallback;
}

const MODALITY_TABS: { key: GoalModality; label: string; icon: typeof Target }[] =
  [
    { key: 'TRADITIONAL', label: 'Tradicional', icon: Target },
    { key: 'INVESTMENT_CALCULATOR', label: 'Investimentos', icon: Calculator },
    { key: 'DEPOSIT_CALENDAR', label: 'Quadradinhos', icon: Grid3x3 },
  ];

export function GoalDetail() {
  const { id } = useParams();
  const goalId = Number(id);
  const navigate = useNavigate();

  const [detail, setDetail] = useState<GoalDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [tab, setTab] = useState<GoalModality>('TRADITIONAL');
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  async function fetchData() {
    try {
      const res = await goalApi.get(goalId);
      setDetail(res.data);
      setTab(res.data.goal.modality);
    } catch (err) {
      setError(true);
      setErrorMessage(getApiMessage(err, 'Não foi possível carregar a meta.'));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalId]);

  async function handleArchive() {
    setArchiving(true);
    setActionError('');
    try {
      await goalApi.archive(goalId);
      load();
    } catch (err) {
      setActionError(getApiMessage(err, 'Não foi possível arquivar a meta.'));
    } finally {
      setArchiving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await goalApi.delete(goalId);
      navigate('/goals');
    } catch (err) {
      setActionError(getApiMessage(err, 'Não foi possível excluir a meta.'));
      setDeleting(false);
      setShowDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingRows rows={4} />
      </div>
    );
  }

  if (error || !detail) {
    return (
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
    );
  }

  const { goal } = detail;

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate('/goals')}
        className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground transition-colors focus-ring rounded-md"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Metas financeiras
      </button>

      <PageHeader
        title={goal.name}
        description={goal.description}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setShowEdit(true)}>
              <Pencil className="w-4 h-4" aria-hidden />
              Editar
            </Button>
            {goal.status !== 'ARCHIVED' && (
              <Button
                variant="ghost"
                onClick={handleArchive}
                loading={archiving}
                title="Arquivar meta"
              >
                <Archive className="w-4 h-4" aria-hidden />
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => setShowDelete(true)}
              title="Excluir meta"
              className="hover:text-destructive hover:bg-destructive-soft"
            >
              <Trash2 className="w-4 h-4" aria-hidden />
            </Button>
          </div>
        }
      />

      {actionError && <FormError>{actionError}</FormError>}

      {/* ===== Indicador de progresso (obrigatório) ===== */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-subtle-fg">Acumulado</p>
            <p className="mt-2 font-mono text-4xl md:text-5xl font-medium tracking-[-0.03em] tabular-nums text-foreground">
              {formatCurrency(goal.currentAmount)}
            </p>
            <p className="mt-1 text-sm text-subtle-fg">
              de {formatCurrency(goal.targetAmount)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {goal.completed && (
              <Badge tone="success">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />
                Concluída
              </Badge>
            )}
            {goal.status === 'ARCHIVED' && <Badge tone="neutral">Arquivada</Badge>}
            <Badge tone="accent">{GOAL_MODALITY_LABELS[goal.modality]}</Badge>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5 text-sm">
            <span className="text-muted-fg">
              {goal.percentage.toFixed(1)}% concluído
            </span>
            <span className="text-muted-fg">
              {goal.completed
                ? 'Objetivo alcançado'
                : `Faltam ${formatCurrency(goal.remainingAmount)}`}
            </span>
          </div>
          <ProgressBar
            value={goal.percentage}
            completed={goal.completed}
            height="h-2"
            label={`Progresso da meta ${goal.name}`}
          />
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-2 pt-1 text-sm">
          <Info label="Valor total desejado" value={formatCurrency(goal.targetAmount)} />
          <Info label="Valor acumulado" value={formatCurrency(goal.currentAmount)} />
          <Info label="Valor restante" value={formatCurrency(goal.remainingAmount)} />
          <Info
            label="Prazo"
            value={
              goal.targetDate
                ? `até ${formatDate(goal.targetDate)}`
                : 'Sem prazo definido'
            }
          />
        </div>
      </section>

      {/* ===== Abas de modalidade ===== */}
      <div className="border-t border-border pt-6">
        <div
          className="flex gap-1 mb-6 border-b border-border"
          role="tablist"
          aria-label="Modalidade"
        >
          {MODALITY_TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className={`relative inline-flex items-center gap-2 px-3 pb-3 pt-1 text-sm transition-colors focus-ring ${
                  active
                    ? 'text-foreground font-medium'
                    : 'text-muted-fg hover:text-foreground'
                }`}
              >
                <t.icon
                  className={`w-4 h-4 ${active ? 'text-accent' : 'text-subtle-fg'}`}
                  aria-hidden
                />
                {t.label}
                {active && (
                  <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-accent rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {tab === 'TRADITIONAL' && (
          <TraditionalPanel detail={detail} onChanged={setDetail} />
        )}
        {tab === 'INVESTMENT_CALCULATOR' && <CalculatorPanel goal={goal} />}
        {tab === 'DEPOSIT_CALENDAR' && (
          <CalendarPanel detail={detail} onChanged={setDetail} />
        )}
      </div>

      {showEdit && (
        <EditGoalModal
          detail={detail}
          onClose={() => setShowEdit(false)}
          onSaved={(d) => {
            setDetail(d);
            setShowEdit(false);
          }}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          title="Excluir meta"
          tone="danger"
          confirmLabel="Excluir"
          loading={deleting}
          description={
            <>
              Deseja excluir a meta{' '}
              <span className="text-foreground font-medium">“{goal.name}”</span>?
              Todo o histórico de movimentações e o calendário serão removidos.
            </>
          }
          onConfirm={handleDelete}
          onClose={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-subtle-fg">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-medium tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function EditGoalModal({
  detail,
  onClose,
  onSaved,
}: {
  detail: GoalDetailResponse;
  onClose: () => void;
  onSaved: (detail: GoalDetailResponse) => void;
}) {
  const [form, setForm] = useState({
    name: detail.goal.name,
    description: detail.goal.description ?? '',
    targetAmount: String(detail.goal.targetAmount),
    startDate: toDateInput(detail.goal.startDate),
    targetDate: detail.goal.targetDate ? toDateInput(detail.goal.targetDate) : '',
    modality: detail.goal.modality,
    color: detail.goal.color ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const target = parseFloat(form.targetAmount.replace(',', '.'));
    if (!form.name.trim()) {
      setError('Informe o nome da meta.');
      return;
    }
    if (!target || target <= 0) {
      setError('Informe um valor desejado válido.');
      return;
    }
    if (form.targetDate && form.targetDate < form.startDate) {
      setError('A data limite não pode ser anterior à data de início.');
      return;
    }
    if (form.modality === 'DEPOSIT_CALENDAR' && !form.targetDate) {
      setError('O calendário de depósitos exige uma data limite.');
      return;
    }

    const payload: UpdateGoalRequest = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      targetAmount: target,
      startDate: form.startDate,
      targetDate: form.targetDate || undefined,
      modality: form.modality,
      color: form.color || undefined,
    };

    setSaving(true);
    try {
      await goalApi.update(detail.goal.id, payload);
      const res = await goalApi.get(detail.goal.id);
      onSaved(res.data);
    } catch (err) {
      setError(getApiMessage(err, 'Não foi possível salvar a meta.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Editar meta"
      description="Alterações no valor desejado recalculam o progresso automaticamente."
      onClose={onClose}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3 space-y-4">
        <Input
          label="Nome"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
        <Input
          label="Descrição (opcional)"
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
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
            required
          />
          <Input
            label="Data de início"
            type="date"
            value={form.startDate}
            onChange={(e) =>
              setForm((p) => ({ ...p, startDate: e.target.value }))
            }
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Data limite (opcional)"
            type="date"
            value={form.targetDate}
            min={form.startDate}
            onChange={(e) =>
              setForm((p) => ({ ...p, targetDate: e.target.value }))
            }
          />
          <Select
            label="Modalidade"
            value={form.modality}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                modality: e.target.value as GoalModality,
              }))
            }
          >
            <option value="TRADITIONAL">{GOAL_MODALITY_LABELS.TRADITIONAL}</option>
            <option value="INVESTMENT_CALCULATOR">
              {GOAL_MODALITY_LABELS.INVESTMENT_CALCULATOR}
            </option>
            <option value="DEPOSIT_CALENDAR">
              {GOAL_MODALITY_LABELS.DEPOSIT_CALENDAR}
            </option>
          </Select>
        </div>

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
