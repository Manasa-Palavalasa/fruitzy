import { AlertModal } from "@/components/common/AlertModal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import React, { createContext, useContext, useState, ReactNode } from "react";


type ModalContextType = {
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, title?: string) => Promise<boolean>;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [alertState, setAlertState] = useState<{ open: boolean, message: string, title?: string, resolve?: () => void }>({ open: false, message: "" });
  const [confirmState, setConfirmState] = useState<{ open: boolean, message: string, title?: string, resolve?: (result: boolean) => void }>({ open: false, message: "" });

  const alert = (message: string, title?: string): Promise<void> =>
    new Promise((resolve) => {
      setAlertState({ open: true, message, title, resolve });
    });

  const confirm = (message: string, title?: string): Promise<boolean> =>
    new Promise((resolve) => {
      setConfirmState({ open: true, message, title, resolve });
    });

  const handleAlertClose = () => {
    alertState.resolve?.();
    setAlertState({ open: false, message: "" });
  };

  const handleConfirmClose = (result: boolean) => {
    confirmState.resolve?.(result);
    setConfirmState({ open: false, message: "" });
  };

  return (
    <ModalContext.Provider value={{ alert, confirm }}>
      {children}
      <AlertModal open={alertState.open} title={alertState.title} message={alertState.message} onClose={handleAlertClose} />
      <ConfirmModal open={confirmState.open} title={confirmState.title} message={confirmState.message} onConfirm={() => handleConfirmClose(true)} onCancel={() => handleConfirmClose(false)} />
    </ModalContext.Provider>
  );
};
