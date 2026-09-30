import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
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
import { categoryApi } from '../services/api';
import type { CategoryResponse } from '../types';

export function Categories() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<CategoryResponse | null>(
    null
  );

  async function fetchData() {
    try {
      const { data } = await categoryApi.list();
      setCategories(data ?? []);
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
      await categoryApi.delete(id);
      load();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Não foi possível excluir a categoria. Tente novamente.';
      setActionError(message);
    } finally {
      setDeletingId(null);
    }
  }

  const incomes = useMemo(
    () => categories.filter((c) => c.type === 'INCOME'),
    [categories]
  );
  const expenses = useMemo(
    () => categories.filter((c) => c.type === 'EXPENSE'),
    [categories]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Organize suas receitas e despesas."
        action={
          <Button
            onClick={() => {
              setFormType('EXPENSE');
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4" aria-hidden />
            Nova categoria
          </Button>
        }
      />

      {actionError && <FormError>{actionError}</FormError>}

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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CategoryPanel
            title="Despesas"
            icon={<ArrowDownRight className="w-4 h-4" aria-hidden />}
            items={expenses}
            type="EXPENSE"
            onDelete={setConfirmTarget}
            deletingId={deletingId}
            onAdd={(type) => {
              setFormType(type);
              setShowForm(true);
            }}
          />
          <CategoryPanel
            title="Receitas"
            icon={<ArrowUpRight className="w-4 h-4" aria-hidden />}
            items={incomes}
            type="INCOME"
            onDelete={setConfirmTarget}
            deletingId={deletingId}
            onAdd={(type) => {
              setFormType(type);
              setShowForm(true);
            }}
          />
        </div>
      )}

      {showForm && (
        <CategoryForm
          initialType={formType}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title="Excluir categoria"
          tone="danger"
          confirmLabel="Excluir"
          description={
            <>
              Deseja excluir a categoria{' '}
              <span className="text-foreground font-medium">
                “{confirmTarget.name}”
              </span>
              ? Categorias em uso por transações, recorrências ou orçamentos não
              podem ser excluídas.
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

function CategoryPanel({
  title,
  icon,
  items,
  type,
  onDelete,
  deletingId,
  onAdd,
}: {
  title: string;
  icon: React.ReactNode;
  items: CategoryResponse[];
  type: 'INCOME' | 'EXPENSE';
  onDelete: (category: CategoryResponse) => void;
  deletingId: number | null;
  onAdd: (type: 'INCOME' | 'EXPENSE') => void;
}) {
  return (
    <div className="border-t border-border pt-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={type === 'INCOME' ? 'text-success' : 'text-destructive'}>
          {icon}
        </span>
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
      </div>
      {items.length === 0 ? (
        <EmptyState
          title={type === 'INCOME' ? 'Sem categorias de receita' : 'Sem categorias de despesa'}
          description="Adicione categorias para organizar seus lançamentos."
          action={
            <Button onClick={() => onAdd(type)} variant="secondary">
              <Plus className="w-4 h-4" aria-hidden />
              Nova categoria
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 py-3 transition-colors hover:bg-white/[0.03]"
            >
              <span
                className={`p-2 rounded-md ${
                  type === 'INCOME'
                    ? 'bg-success-soft text-success'
                    : 'bg-destructive-soft text-destructive'
                }`}
              >
                {type === 'INCOME' ? (
                  <ArrowUpRight className="w-4 h-4" aria-hidden />
                ) : (
                  <ArrowDownRight className="w-4 h-4" aria-hidden />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                {c.description && (
                  <p className="mt-0.5 text-xs text-muted-fg truncate">
                    {c.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => onDelete(c)}
                disabled={deletingId === c.id}
                className="text-subtle-fg hover:text-destructive hover:bg-destructive-soft transition-colors rounded-md p-2 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Excluir ${c.name}`}
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryForm({
  initialType,
  onClose,
  onSaved,
}: {
  initialType: 'EXPENSE' | 'INCOME';
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    type: initialType,
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
    if (!form.name.trim()) {
      setError('Informe o nome da categoria.');
      return;
    }
    setSaving(true);
    try {
      await categoryApi.create({
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim() || undefined,
      });
      onSaved();
    } catch {
      setError('Não foi possível salvar a categoria.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Nova categoria"
      description="Classifique seus lançamentos em grupos."
      onClose={onClose}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3 space-y-4">
        <Input
          label="Nome"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Ex.: Alimentação, Transporte"
          required
        />
        <Select
          label="Tipo"
          value={form.type}
          onChange={(e) => updateField('type', e.target.value)}
        >
          <option value="EXPENSE">Despesa</option>
          <option value="INCOME">Receita</option>
        </Select>
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
