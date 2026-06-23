import { createContext, useContext, useState } from "react";

interface QuoteModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const QuoteModalContext = createContext<QuoteModalContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function QuoteModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <QuoteModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </QuoteModalContext.Provider>
  );
}

export const useQuoteModal = () => useContext(QuoteModalContext);
