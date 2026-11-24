import { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

/** Intervalo de datas selecionado (strings ISO yyyy-mm-dd ou vazio). */
export interface DateFilter {
  mode: 'day' | 'range';
  from: string; // yyyy-mm-dd
  to: string; // yyyy-mm-dd (modo range)
}

export const EMPTY_DATE_FILTER: DateFilter = {
  mode: 'range',
  from: '',
  to: '',
};

export function isDateFilterEmpty(f: DateFilter): boolean {
  return f.from === '' && f.to === '';
}

function toISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISO(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/**
 * Filtro de data com popover de calendário.
 * Permite escolher um dia específico ou um período (de/até).
 */
export function DateRangePicker({
  value,
  onChange,
}: {
  value: DateFilter;
  onChange: (next: DateFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = parseISO(value.from) ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const active = !isDateFilterEmpty(value);
  const label = buildLabel(value);

  function selectDay(iso: string) {
    if (value.mode === 'day') {
      onChange({ mode: 'day', from: iso, to: '' });
      setOpen(false);
      return;
    }
    // Modo período: primeiro clique define início; segundo define fim.
    if (!value.from || (value.from && value.to)) {
      onChange({ mode: 'range', from: iso, to: '' });
    } else if (iso < value.from) {
      onChange({ mode: 'range', from: iso, to: value.from });
    } else {
      onChange({ mode: 'range', from: value.from, to: iso });
      setOpen(false);
    }
  }

  function clear() {
    onChange({ mode: value.mode, from: '', to: '' });
  }

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border px-3 text-sm transition-colors focus-ring whitespace-nowrap sm:w-auto ${
          active
            ? 'border-accent/50 bg-accent-soft/40 text-foreground'
            : 'border-border bg-surface-raised text-muted-fg hover:border-border-strong hover:text-foreground'
        }`}
      >
        <CalendarDays className="w-4 h-4 shrink-0" aria-hidden />
        <span className="truncate">{label}</span>
        {active && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Limpar filtro de data"
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                clear();
              }
            }}
            className="text-subtle-fg hover:text-foreground rounded p-0.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Filtrar por data"
          className="absolute left-0 z-40 mt-2 w-[288px] max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface-card p-3 shadow-xl shadow-black/40 sm:left-auto sm:right-0"
        >
          {/* Modo */}
          <div className="flex gap-1 rounded-md bg-surface-muted p-1 mb-3">
            <ModeTab
              active={value.mode === 'day'}
              onClick={() => onChange({ mode: 'day', from: value.from, to: '' })}
              label="Dia específico"
            />
            <ModeTab
              active={value.mode === 'range'}
              onClick={() => onChange({ mode: 'range', from: value.from, to: '' })}
              label="Período"
            />
          </div>

          {/* Navegação de mês */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() =>
                setViewMonth(
                  (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)
                )
              }
              className="p-1.5 rounded-md text-subtle-fg hover:text-foreground hover:bg-white/5 transition-colors focus-ring"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-foreground">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() =>
                setViewMonth(
                  (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)
                )
              }
              className="p-1.5 rounded-md text-subtle-fg hover:text-foreground hover:bg-white/5 transition-colors focus-ring"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Cabeçalho dias da semana */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((w, i) => (
              <span
                key={i}
                className="h-7 flex items-center justify-center text-[11px] font-medium text-subtle-fg"
              >
                {w}
              </span>
            ))}
          </div>

          <CalendarGrid
            viewMonth={viewMonth}
            value={value}
            onSelect={selectDay}
          />

          {/* Rodapé */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-xs text-subtle-fg truncate">
              {value.mode === 'range'
                ? value.from && value.to
                  ? `${formatShort(value.from)} → ${formatShort(value.to)}`
                  : value.from
                  ? `${formatShort(value.from)} → ...`
                  : 'Selecione o início'
                : value.from
                ? formatShort(value.from)
                : 'Selecione um dia'}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-accent hover:text-foreground transition-colors px-2 py-1 rounded-md focus-ring"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarGrid({
  viewMonth,
  value,
  onSelect,
}: {
  viewMonth: Date;
  value: DateFilter;
  onSelect: (iso: string) => void;
}) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayIso = toISO(new Date());

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="grid grid-cols-7 gap-y-0.5">
      {cells.map((day, idx) => {
        if (day === null) return <span key={`empty-${idx}`} />;
        const iso = toISO(new Date(year, month, day));
        const isFrom = value.from === iso;
        const isTo = value.to === iso;
        const isEdge = isFrom || isTo;
        const inRange =
          value.mode === 'range' &&
          value.from &&
          value.to &&
          iso > value.from &&
          iso < value.to;
        const isToday = iso === todayIso;

        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelect(iso)}
            className={`h-8 w-8 mx-auto flex items-center justify-center rounded-md text-sm transition-colors focus-ring ${
              isEdge
                ? 'bg-accent text-[#0b0b0c] font-medium'
                : inRange
                ? 'bg-accent-soft text-foreground'
                : 'text-foreground hover:bg-white/5'
            } ${isToday && !isEdge ? 'ring-1 ring-accent/40' : ''}`}
            aria-label={formatShort(iso)}
            aria-pressed={isEdge}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 h-7 rounded text-xs transition-colors focus-ring ${
        active
          ? 'bg-surface-raised text-foreground font-medium'
          : 'text-muted-fg hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

function formatShort(iso: string): string {
  const d = parseISO(iso);
  if (!d) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

function buildLabel(value: DateFilter): string {
  if (isDateFilterEmpty(value)) return 'Data';
  if (value.mode === 'day') {
    return value.from ? formatShort(value.from) : 'Data';
  }
  if (value.from && value.to) {
    return `${formatShort(value.from)} – ${formatShort(value.to)}`;
  }
  if (value.from) return `A partir de ${formatShort(value.from)}`;
  return 'Data';
}
