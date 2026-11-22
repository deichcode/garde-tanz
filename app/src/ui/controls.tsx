/* Bedienelemente des Design-Systems „Gardemaß“ (design-system/components.css). */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'signal' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'm' | 'l';
  stack?: boolean;
  icon?: IconName;
}

/** Taste: Text ist immer dabei und sagt, was passiert. */
export function Button({ variant = 'secondary', size = 'm', stack, icon, className, children, type = 'button', ...rest }: ButtonProps) {
  const cls = ['gm-btn', `gm-btn--${variant}`, size === 'l' && 'gm-btn--l', stack && 'gm-btn--stack', className].filter(Boolean).join(' ');
  return (
    <button type={type} className={cls} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

/** Stepper für Zeiten: Minus/Plus 48 px, Zahl in Mono. */
export function Stepper({ value, onChange, min = 1, max = 64, label, unit = 'Zeiten', size = 'm' }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; label: string; unit?: string; size?: 'm' | 'l';
}) {
  return (
    <div className={'gm-stepper' + (size === 'l' ? ' gm-stepper--l' : '')} role="group" aria-label={label}>
      <button type="button" aria-label={`Weniger ${unit}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
        <Icon name="minus" />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label={`Mehr ${unit}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
        <Icon name="plus" />
      </button>
    </div>
  );
}

/** Segment-Auswahl mit zwei bis drei Optionen. */
export function Seg<T extends string>({ value, options, onChange, label }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string;
}) {
  return (
    <div className="gm-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Badge({ tone, icon, children, title }: { tone: 'warn' | 'ok' | 'danger' | 'edit' | 'neutral'; icon?: IconName; children?: ReactNode; title?: string }) {
  return (
    <span className={`gm-badge gm-badge--${tone}`} title={title}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}
