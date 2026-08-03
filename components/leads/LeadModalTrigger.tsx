"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useLeadModal } from "@/components/leads/LeadModalProvider";
import type { LeadMode } from "@/lib/leads";
import type { LeadContext } from "@/components/leads/lead-state";

type LeadModalTriggerProps = {
  mode: LeadMode;
  context?: LeadContext;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function LeadModalTrigger({
  mode,
  context,
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
          openLeadModal(mode, context);
        }
      }}
    >
      {children}
    </button>
  );
}
