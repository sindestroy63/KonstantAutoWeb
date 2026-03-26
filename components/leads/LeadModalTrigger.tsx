"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useLeadModal } from "@/components/leads/LeadModalProvider";
import type { LeadMode, LeadPrefill } from "@/lib/leads";

type LeadModalTriggerProps = {
  mode: LeadMode;
  prefill?: LeadPrefill;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function LeadModalTrigger({
  mode,
  prefill,
  children,
  onClick,
  type,
  ...props
}: LeadModalTriggerProps) {
  const { openLeadModal } = useLeadModal();

  return (
    <button
      {...props}
      type={type ?? "button"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          openLeadModal(mode, prefill);
        }
      }}
    >
      {children}
    </button>
  );
}
