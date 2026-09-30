import { DollarSign } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizeMap = {
  sm: 'w-7 h-7',
  md: 'w-8 h-8',
  lg: 'w-11 h-11',
};

const iconMap = {
  sm: 'w-4 h-4',
  md: 'w-[18px] h-[18px]',
  lg: 'w-6 h-6',
};

const textMap = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
};

export function Logo({ size = 'md', showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <span
        className={`${sizeMap[size]} relative inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground`}
        aria-hidden
      >
        <DollarSign className={iconMap[size]} strokeWidth={2.5} />
      </span>
      {showText && (
        <span
          className={`${textMap[size]} font-medium tracking-[-0.02em] text-foreground`}
        >
          Vault
        </span>
      )}
    </div>
  );
}
