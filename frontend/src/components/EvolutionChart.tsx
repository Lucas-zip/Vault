import { useId, useMemo } from 'react';
import type { EvolutionPoint } from '../types';
import { formatCurrency } from '../utils/format';

/**
 * Gráfico de área da evolução do patrimônio (aporte x rendimento).
 * Feito em SVG puro para não adicionar dependências e manter a
 * identidade visual do Vault. Mostra duas séries empilhadas:
 * valor investido (base) e rendimento acumulado (topo).
 */
export function EvolutionChart({
  data,
  height = 220,
}: {
  data: EvolutionPoint[];
  height?: number;
}) {
  const gradientId = useId();

  const { investedPath, balancePath, maxValue, points } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        investedPath: '',
        balancePath: '',
        maxValue: 0,
        points: [] as EvolutionPoint[],
      };
    }

    // Amostragem para não saturar o gráfico em prazos longos.
    const maxPoints = 90;
    const step = Math.max(1, Math.ceil(data.length / maxPoints));
    const sampled = data.filter(
      (_, i) => i % step === 0 || i === data.length - 1
    );

    const max = Math.max(...sampled.map((p) => p.balance), 1);
    const width = 100;
    const h = 100;

    const x = (i: number) =>
      sampled.length === 1 ? 0 : (i / (sampled.length - 1)) * width;
    const y = (v: number) => h - (v / max) * h;

    const invested = sampled
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.invested)}`)
      .join(' ');
    const balance = sampled
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.balance)}`)
      .join(' ');

    return {
      investedPath: invested,
      balancePath: balance,
      maxValue: max,
      points: sampled,
    };
  }, [data]);

  if (!data || data.length === 0) {
    return null;
  }

  const last = points[points.length - 1];

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
        role="img"
        aria-label="Evolução do patrimônio projetado"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Linhas de referência */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            x2="100"
            y1={100 * f}
            y2={100 * f}
            stroke="var(--color-border)"
            strokeWidth="0.3"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Área do saldo */}
        <path
          d={`${balancePath} L100,100 L0,100 Z`}
          fill={`url(#${gradientId})`}
          stroke="none"
        />
        {/* Linha do saldo total */}
        <path
          d={balancePath}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Linha do valor investido (tracejada) */}
        <path
          d={investedPath}
          fill="none"
          stroke="var(--color-subtle-fg)"
          strokeWidth="1.2"
          strokeDasharray="3 2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <Legend color="var(--color-accent)" label="Patrimônio" />
          <Legend color="var(--color-subtle-fg)" label="Investido" dashed />
        </div>
        <span className="font-mono tabular-nums text-muted-fg">
          pico {formatCurrency(maxValue)}
          {last ? ` · fim ${formatCurrency(last.balance)}` : ''}
        </span>
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
  dashed = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-fg">
      <span
        className="inline-block w-4"
        style={{
          height: 2,
          backgroundColor: dashed ? 'transparent' : color,
          borderTop: dashed ? `2px dashed ${color}` : undefined,
        }}
        aria-hidden
      />
      {label}
    </span>
  );
}
