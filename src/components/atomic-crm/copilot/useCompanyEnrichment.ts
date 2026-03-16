import { useState, useEffect } from "react";

const API_BASE =
  import.meta.env.VITE_COPILOTKIT_API_URL || "http://localhost:4000";

export interface CompanyEnrichmentData {
  contacts: Array<Record<string, unknown>>;
  stats: {
    total: number;
    hot: number;
    warm: number;
    cold: number;
    inContract: number;
  };
}

export function useCompanyEnrichment(companyName?: string): {
  data: CompanyEnrichmentData | null;
  isLoading: boolean;
} {
  const [data, setData] = useState<CompanyEnrichmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!companyName) return;
    setIsLoading(true);
    fetch(
      `${API_BASE}/api/companies/${encodeURIComponent(companyName)}/contacts`,
    )
      .then((r) => r.json())
      .then(setData)
      .catch((err) => console.warn("Company enrichment failed:", err))
      .finally(() => setIsLoading(false));
  }, [companyName]);

  return { data, isLoading };
}
