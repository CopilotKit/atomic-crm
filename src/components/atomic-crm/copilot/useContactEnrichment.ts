import { useState, useEffect } from "react";

const API_BASE =
  import.meta.env.VITE_COPILOTKIT_API_URL || "http://localhost:4000";

export interface EnrichedContactData {
  lifecycle_stage: string;
  lead_score: number;
  last_activity_date: string;
  last_activity_type: string;
  renewal_amount: number | null;
  renewal_date: string | null;
  renewal_forecast_category: string | null;
  renewal_probability: number | null;
  contract_file: string | null;
  economic_buyer_identified: boolean;
  budget_confirmed: boolean;
  legal_review_status: string;
  security_review_status: string;
  champion_confidence: string;
  competitor: string | null;
  next_best_action: string | null;
  notes_summary: string | null;
}

export function useContactEnrichment(
  firstName?: string,
  lastName?: string,
): { data: EnrichedContactData | null; isLoading: boolean } {
  const [data, setData] = useState<EnrichedContactData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!firstName || !lastName) return;
    setIsLoading(true);
    fetch(
      `${API_BASE}/api/contacts?first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}`,
    )
      .then((r) => r.json())
      .then((contacts) => {
        if (Array.isArray(contacts) && contacts.length > 0) {
          setData(contacts[0]);
        }
      })
      .catch((err) => console.warn("Contact enrichment failed:", err))
      .finally(() => setIsLoading(false));
  }, [firstName, lastName]);

  return { data, isLoading };
}
