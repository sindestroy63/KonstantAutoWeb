"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LeadMode } from "@/lib/leads";
import type { LeadContext } from "@/components/leads/lead-state";

const LeadModal = dynamic(
  () => import("@/components/leads/LeadModal").then((module) => module.LeadModal),
  { ssr: false }
);

type LeadModalContextValue = {
  openLeadModal: (mode: LeadMode, context?: LeadContext) => void;
  closeLeadModal: () => void;
};

const LeadModalContext = createContext<LeadModalContextValue | null>(null);

export function LeadModalProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LeadMode>("selection");
  const [isOpen, setIsOpen] = useState(false);
  const [leadContext, setLeadContext] = useState<LeadContext | undefined>(undefined);

  const openLeadModal = useCallback((nextMode: LeadMode, nextContext?: LeadContext) => {
    setMode(nextMode);
    setLeadContext(nextContext);
    setIsOpen(true);
  }, []);

  const closeLeadModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      openLeadModal,
      closeLeadModal,
    }),
    [closeLeadModal, openLeadModal]
  );

  return (
    <LeadModalContext.Provider value={value}>
      {children}
      {isOpen ? (
        <LeadModal isOpen mode={mode} context={leadContext} onClose={closeLeadModal} />
      ) : null}
    </LeadModalContext.Provider>
  );
}

export function useLeadModal() {
  const context = useContext(LeadModalContext);

  if (!context) {
    throw new Error("useLeadModal must be used within LeadModalProvider");
  }

  return context;
}
