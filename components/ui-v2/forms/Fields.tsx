"use client";

import { forwardRef, useId, type CSSProperties, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { cx } from "../core/cx";
import styles from "./Fields.module.css";

type FieldMeta = {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
};

function FieldShell({ id, label, description, error, required, children }: FieldMeta & { id: string; children: ReactNode }) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}{required ? <span className={styles.required} aria-hidden="true"> *</span> : null}</label>
      {description ? <span id={descriptionId} className={styles.description}>{description}</span> : null}
      {children}
      {error ? <span id={errorId} className={cx(styles.message, styles.errorMessage)} role="alert">{error}</span> : null}
    </div>
  );
}

function describedBy(id: string, description?: string, error?: string) {
  return [description ? `${id}-description` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & FieldMeta;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id: providedId, label, description, error, required, className, ...props },
  ref,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <FieldShell id={id} label={label} description={description} error={error} required={required}>
      <input ref={ref} id={id} required={required} aria-invalid={Boolean(error)} aria-describedby={describedBy(id, description, error)} className={cx(styles.control, className)} {...props} />
    </FieldShell>
  );
});

export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & FieldMeta & { children: ReactNode };

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { id: providedId, label, description, error, required, className, children, ...props },
  ref,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <FieldShell id={id} label={label} description={description} error={error} required={required}>
      <select ref={ref} id={id} required={required} aria-invalid={Boolean(error)} aria-describedby={describedBy(id, description, error)} className={cx(styles.control, className)} {...props}>{children}</select>
    </FieldShell>
  );
});

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  error?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id: providedId, label, error, className, ...props },
  ref,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={styles.field}>
      <label className={styles.checkboxLabel} htmlFor={id}>
        <input ref={ref} id={id} type="checkbox" aria-invalid={Boolean(error)} aria-describedby={errorId} className={cx(styles.checkbox, className)} {...props} />
        <span className={styles.checkboxText}>{label}</span>
      </label>
      {error ? <span id={errorId} className={cx(styles.message, styles.errorMessage)} role="alert">{error}</span> : null}
    </div>
  );
});

export type SegmentedControlProps<Value extends string> = {
  label: string;
  value: Value;
  options: ReadonlyArray<{ value: Value; label: string }>;
  onChange: (value: Value) => void;
  className?: string;
};

export function SegmentedControl<Value extends string>({ label, value, options, onChange, className }: SegmentedControlProps<Value>) {
  const style = { "--ka-v2-segment-count": options.length } as CSSProperties;
  return (
    <div role="group" aria-label={label} className={cx(styles.segmented, className)} style={style}>
      {options.map((option) => (
        <button key={option.value} type="button" aria-pressed={option.value === value} className={cx(styles.segment, option.value === value && styles.segmentActive)} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}
