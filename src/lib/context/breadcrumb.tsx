"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface BreadcrumbContextValue {
  dynamicLabels: Record<string, string>;
  setDynamicLabel: (segment: string, label: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  dynamicLabels: {},
  setDynamicLabel: () => {},
});

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({});

  const setDynamicLabel = (segment: string, label: string) => {
    setDynamicLabels((prev) =>
      prev[segment] === label ? prev : { ...prev, [segment]: label }
    );
  };

  return (
    <BreadcrumbContext.Provider value={{ dynamicLabels, setDynamicLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  return useContext(BreadcrumbContext);
}
