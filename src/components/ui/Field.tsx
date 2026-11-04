"use client";

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
}

export function Field({ label, value, onChange, placeholder, type = "text", autoFocus }: FieldProps) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-medium text-foreground-muted mb-1.5">
        {label}
      </span>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-muted border border-border rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors"
      />
    </label>
  );
}

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "danger" | "ghost";
}

export function Button({
  children,
  onClick,
  type = "button",
  disabled,
  variant = "primary",
}: PrimaryButtonProps) {
  const styles = {
    primary: "bg-accent text-[var(--accent-contrast)]",
    danger: "bg-[var(--danger)] text-white",
    ghost: "bg-surface-muted text-foreground",
  } as const;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full font-medium rounded-[var(--radius-sm)] py-3 text-sm disabled:opacity-50 active:scale-[0.98] transition-transform ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
