"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LeadModal } from "@/components/leads/LeadModal";
import type { LeadMode, LeadPrefill } from "@/lib/leads";

type LeadModalContextValue = {
  openLeadModal: (mode: LeadMode, prefill?: LeadPrefill) => void;
  closeLeadModal: () => void;
};

const LeadModalContext = createContext<LeadModalContextValue | null>(null);

export function LeadModalProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LeadMode>("selection");
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<LeadPrefill | undefined>(undefined);

  const openLeadModal = useCallback((nextMode: LeadMode, nextPrefill?: LeadPrefill) => {
    setMode(nextMode);
    setPrefill(nextPrefill);
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
      <LeadModal isOpen={isOpen} mode={mode} prefill={prefill} onClose={closeLeadModal} />
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
