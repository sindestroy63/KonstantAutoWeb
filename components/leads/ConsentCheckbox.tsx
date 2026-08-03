"use client";

import Link from "next/link";

type ConsentCheckboxProps = {
  checked: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
};

export function ConsentCheckbox({ checked, error, onChange }: ConsentCheckboxProps) {
  return (
    <div>
      <label className="flex min-h-11 cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className={`mt-0.5 h-5 w-5 shrink-0 rounded border bg-white/[0.05] accent-[#e31b23] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ff3b42] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111417] ${
            error ? "border-[#ff5a60]" : "border-white/25"
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "lead-consent-error" : undefined}
        />
        <span className="text-sm leading-relaxed text-white/52">
          Согласен с{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white/72 underline decoration-white/25 underline-offset-2 transition-colors hover:text-white"
          >
            политикой обработки персональных данных
          </Link>
        </span>
      </label>
      {error ? <p id="lead-consent-error" className="mt-2 text-xs font-medium text-[#ff5a60]">{error}</p> : null}
    </div>
  );
}
