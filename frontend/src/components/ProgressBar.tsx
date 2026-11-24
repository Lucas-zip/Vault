import { clampPercent } from '../utils/goals';

/**
 * Barra de progresso discreta, alinhada à identidade visual do Vault.
 * Usa a cor de acento quando em andamento, sucesso quando concluída
 * e destructive para indicar estouro/limite excedido.
 */
export function ProgressBar({
  value,
  completed = false,
  className = '',
  height = 'h-1.5',
  label,
  tone,
}: {
  value: number;
  completed?: boolean;
  className?: string;
  height?: string;
  label?: string;
  tone?: 'accent' | 'success' | 'destructive' | 'warning';
}) {
  const percent = clampPercent(value);
  const barColor =
    tone === 'destructive'
      ? 'bg-destructive'
      : tone === 'warning'
      ? 'bg-warning'
      : tone === 'success' || completed
      ? 'bg-success'
      : 'bg-accent';
  return (
    <div
      className={`w-full rounded-full bg-surface-strong overflow-hidden ${height} ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progresso da meta'}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${barColor}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

