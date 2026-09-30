import {
  useId,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { Loader2, X, AlertCircle, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

// ===== Card =====
export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface border border-border rounded-lg ${className}`}>
      {children}
    </div>
  );
}

// ===== Button =====
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover',
  secondary:
    'border border-border-strong bg-surface-raised text-foreground hover:bg-surface-strong',
  ghost: 'text-muted-fg hover:text-foreground hover:bg-white/5',
  danger:
    'bg-destructive text-[#0b0b0c] hover:bg-destructive-hover',
  outline:
    'border border-border-strong bg-transparent text-foreground hover:bg-white/5',
};

export function Button({
  children,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${buttonVariants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

// ===== Input =====
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  trailingAction?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  icon,
  trailingAction,
  className = '',
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            aria-hidden
            className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-fg pointer-events-none"
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={messageId}
          className={`w-full h-9 rounded-md bg-surface-raised border px-3 text-sm text-foreground placeholder:text-subtle-fg transition-colors focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent ${
            icon ? 'pl-10' : ''
          } ${
            trailingAction ? 'pr-11' : ''
          } ${
            error
              ? 'border-destructive'
              : 'border-border hover:border-border-strong'
          } ${className}`}
          {...props}
        />
        {trailingAction && (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {trailingAction}
          </span>
        )}
      </div>
      {error && (
        <p id={messageId} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={messageId} className="mt-1.5 text-xs text-muted-fg">
          {hint}
        </p>
      )}
    </div>
  );
}

type PasswordInputProps = Omit<InputProps, 'type' | 'trailingAction'>;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      trailingAction={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="text-subtle-fg hover:text-foreground hover:bg-surface-muted rounded-md p-2 transition-colors focus-ring"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
}

// ===== Select =====
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Select({
  label,
  error,
  hint,
  className = '',
  children,
  id,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const messageId = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={messageId}
        className={`w-full h-9 rounded-md bg-surface-raised border px-3 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent ${
          error
            ? 'border-destructive'
            : 'border-border hover:border-border-strong'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={messageId} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={messageId} className="mt-1.5 text-xs text-muted-fg">
          {hint}
        </p>
      )}
    </div>
  );
}

// ===== Badge =====
type BadgeTone = 'success' | 'danger' | 'neutral' | 'accent' | 'warning' | 'info';

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  const tones: Record<BadgeTone, string> = {
    success: 'bg-success-soft text-success',
    danger: 'bg-destructive-soft text-destructive',
    neutral: 'bg-surface-muted text-muted-fg',
    accent: 'bg-accent-soft text-accent',
    warning: 'bg-warning-soft text-warning',
    info: 'bg-info-soft text-info',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// ===== Form error =====
export function FormError({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-md bg-destructive-soft border border-destructive/20 px-3 py-2.5 text-sm text-destructive"
    >
      {children}
    </div>
  );
}

// ===== Empty state =====
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-5 text-center">
      {icon && (
        <div className="text-subtle-fg mb-3 [&>svg]:w-7 [&>svg]:h-7">{icon}</div>
      )}
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-fg max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ===== Error state =====
export function ErrorState({
  title = 'Não foi possível carregar',
  description = 'Verifique sua conexão e tente novamente.',
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-5 text-center">
      <div className="text-destructive mb-3">
        <AlertCircle className="w-7 h-7" aria-hidden />
      </div>
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-fg max-w-sm leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ===== Section =====
export function Section({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border-t border-border pt-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-sm font-medium text-foreground">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-subtle-fg">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

// ===== Page header =====
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-medium text-foreground tracking-[-0.02em]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-subtle-fg">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ===== Loading skeleton =====
export function LoadingRows({
  rows = 5,
  className = '',
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={`space-y-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Carregando"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-md bg-surface-muted animate-pulse"
          aria-hidden
        />
      ))}
    </div>
  );
}

// ===== Modal =====
export function Modal({
  title,
  description,
  onClose,
  children,
  className = '',
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => previousFocus.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
      <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`w-full bg-surface-card border border-border-strong rounded-lg ${className}`}
        style={{ outline: 'none' }}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-1">
          <div>
            <h2 className="text-lg font-medium text-foreground">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-fg">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-fg hover:text-foreground hover:bg-surface-muted rounded-md p-2 transition-colors focus-ring"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ===== Confirm dialog =====
type ConfirmTone = 'default' | 'danger' | 'warning' | 'success';

const confirmToneStyles: Record<
  ConfirmTone,
  { icon: ReactNode; badge: string; confirmVariant: ButtonVariant }
> = {
  default: {
    icon: <AlertCircle className="w-5 h-5" aria-hidden />,
    badge: 'bg-accent-soft text-accent',
    confirmVariant: 'primary',
  },
  danger: {
    icon: <AlertTriangle className="w-5 h-5" aria-hidden />,
    badge: 'bg-destructive-soft text-destructive',
    confirmVariant: 'danger',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" aria-hidden />,
    badge: 'bg-warning-soft text-warning',
    confirmVariant: 'primary',
  },
  success: {
    icon: <CheckCircle2 className="w-5 h-5" aria-hidden />,
    badge: 'bg-success-soft text-success',
    confirmVariant: 'primary',
  },
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  loading = false,
  onConfirm,
  onClose,
}: {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const styles = confirmToneStyles[tone];

  return (
    <Modal title={title} onClose={onClose} className="max-w-md">
      <div className="px-5 pb-5 pt-1 space-y-4">
        {description && (
          <div className="flex items-start gap-3">
            <span
              className={`shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md ${styles.badge}`}
            >
              {styles.icon}
            </span>
            <div className="text-sm text-muted-fg leading-relaxed pt-0.5">
              {description}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={styles.confirmVariant}
            fullWidth
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
