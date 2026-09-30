import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Wallet, Building2, CreditCard, Trash2, Landmark } from 'lucide-react';
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
import { accountApi } from '../services/api';
import type { AccountResponse, AccountType } from '../types';
import { formatCurrency, ACCOUNT_TYPE_LABELS } from '../utils/format';

const ACCOUNT_TYPES: AccountType[] = [
  'CHECKING',
  'SAVINGS',
  'WALLET',
  'INVESTMENT',
  'CREDIT_CARD',
];

const ACCOUNT_ICONS: Record<AccountType, React.ReactNode> = {
  CHECKING: <Landmark className="w-5 h-5" />,
  SAVINGS: <Wallet className="w-5 h-5" />,
  WALLET: <Wallet className="w-5 h-5" />,
  INVESTMENT: <Building2 className="w-5 h-5" />,
  CREDIT_CARD: <CreditCard className="w-5 h-5" />,
};

export function Accounts() {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AccountResponse | null>(
    null
  );

  async function fetchData() {
    try {
      const { data } = await accountApi.list();
      setAccounts(data?.content ?? []);
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
      await accountApi.delete(id);
      load();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Não foi possível excluir a conta. Tente novamente.';
      setActionError(message);
    } finally {
      setDeletingId(null);
    }
  }

  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.currentBalance, 0),
    [accounts]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas"
        description="Gerencie suas contas e saldos."
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" aria-hidden />
            Nova conta
          </Button>
        }
      />

      {actionError && <FormError>{actionError}</FormError>}

      <section className="border-b border-border pb-6">
        <p className="text-sm text-subtle-fg">Saldo consolidado</p>
        <p className="mt-3 font-mono text-3xl font-medium tracking-[-0.03em] tabular-nums text-foreground">
          {formatCurrency(totalBalance)}
        </p>
      </section>

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
      ) : accounts.length === 0 ? (
        <div className="border-t border-border">
          <EmptyState
            title="Nenhuma conta cadastrada"
            description="Crie sua primeira conta para começar a registrar transações."
            action={
              <Button onClick={() => setShowForm(true)} variant="secondary">
                <Plus className="w-4 h-4" aria-hidden />
                Nova conta
              </Button>
            }
          />
        </div>
      ) : (
        <div className="border-t border-border divide-y divide-border">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center gap-3 py-3 transition-colors hover:bg-white/[0.03]"
            >
              <span className="p-2 rounded-md bg-surface-raised text-foreground">
                  {ACCOUNT_ICONS[acc.type as AccountType] ?? (
                    <Wallet className="w-5 h-5" />
                  )}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate">
                  {acc.name}
                </h3>
                <p className="mt-0.5 text-xs text-muted-fg truncate">
                  {ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}
                  {acc.institution ? ` · ${acc.institution}` : ''}
                </p>
              </div>
              <span
                className={`font-mono text-sm font-medium tabular-nums ${
                  acc.currentBalance >= 0 ? 'text-foreground' : 'text-destructive'
                }`}
              >
                {formatCurrency(acc.currentBalance)}
              </span>
                <button
                  onClick={() => setConfirmTarget(acc)}
                  disabled={deletingId === acc.id}
                  className="text-subtle-fg hover:text-destructive hover:bg-destructive-soft transition-colors rounded-md p-2 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Excluir ${acc.name}`}
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AccountForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title="Excluir conta"
          tone="danger"
          confirmLabel="Excluir"
          description={
            <>
              Deseja excluir a conta{' '}
              <span className="text-foreground font-medium">
                “{confirmTarget.name}”
              </span>
              ? Contas que possuem transações não podem ser excluídas.
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

function AccountForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    type: 'CHECKING',
    initialBalance: '',
    institution: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const initialBalance = parseFloat((form.initialBalance || '0').replace(',', '.'));
    if (!form.name.trim()) {
      setError('Informe um nome para a conta.');
      return;
    }

    setSaving(true);
    try {
      await accountApi.create({
        name: form.name.trim(),
        type: form.type,
        initialBalance: Number.isNaN(initialBalance) ? 0 : initialBalance,
        institution: form.institution.trim() || undefined,
        description: form.description.trim() || undefined,
      });
      onSaved();
    } catch {
      setError('Não foi possível salvar a conta.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Nova conta"
      description="Adicione uma conta para organizar seus saldos."
      onClose={onClose}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3 space-y-4">
        <Input
          label="Nome da conta"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Ex.: Conta principal"
          required
        />
        <Select
          label="Tipo"
          value={form.type}
          onChange={(e) => updateField('type', e.target.value)}
        >
          {ACCOUNT_TYPES.map((type) => (
            <option key={type} value={type}>
              {ACCOUNT_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
        <Input
          label="Saldo inicial"
          type="number"
          step="0.01"
          value={form.initialBalance}
          onChange={(e) => updateField('initialBalance', e.target.value)}
          placeholder="0,00"
        />
        <Input
          label="Instituição"
          value={form.institution}
          onChange={(e) => updateField('institution', e.target.value)}
          placeholder="Ex.: Nubank, Banco do Brasil"
        />
        <Input
          label="Descrição"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Descrição opcional"
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
