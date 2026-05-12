import fs from "node:fs";
import Papa from "papaparse";

export interface EnrichedContact {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  title: string;
  company_name: string;
  company_id: number;
  status: string;
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

let contacts: EnrichedContact[] = [];

export function loadContacts(csvPath: string): void {
  const csvText = fs.readFileSync(csvPath, "utf-8");
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });

  contacts = result.data.map((row: any) => ({
    id: parseInt(row.id, 10),
    first_name: row.first_name ?? "",
    last_name: row.last_name ?? "",
    gender: row.gender ?? "",
    title: row.title ?? "",
    company_name: row.company_name ?? row.company ?? "",
    company_id: parseInt(row.company_id, 10) || 0,
    status: row.status ?? "",
    lifecycle_stage: row.lifecycle_stage ?? "",
    lead_score: parseInt(row.lead_score, 10) || 0,
    last_activity_date: row.last_activity_date ?? "",
    last_activity_type: row.last_activity_type ?? "",
    renewal_amount: row.renewal_amount ? parseFloat(row.renewal_amount) : null,
    renewal_date: row.renewal_date || null,
    renewal_forecast_category: row.renewal_forecast_category || null,
    renewal_probability: row.renewal_probability
      ? parseFloat(row.renewal_probability)
      : null,
    contract_file: row.contract_file || null,
    economic_buyer_identified: row.economic_buyer_identified === "True",
    budget_confirmed: row.budget_confirmed === "True",
    legal_review_status: row.legal_review_status ?? "",
    security_review_status: row.security_review_status ?? "",
    champion_confidence: row.champion_confidence ?? "",
    competitor: row.competitor || null,
    next_best_action: row.next_best_action || null,
    notes_summary: row.notes_summary || null,
  }));
}

export function getAllContacts(): EnrichedContact[] {
  return contacts;
}

export function getContactById(id: number): EnrichedContact | undefined {
  return contacts.find((c) => c.id === id);
}

export function getContactByName(
  firstName: string,
  lastName: string,
): EnrichedContact | undefined {
  return contacts.find(
    (c) =>
      c.first_name.toLowerCase() === firstName.toLowerCase() &&
      c.last_name.toLowerCase() === lastName.toLowerCase(),
  );
}

export function searchContacts(filters: {
  company?: string;
  lifecycleStage?: string;
  leadScoreMin?: number;
  leadScoreMax?: number;
  status?: string;
}): EnrichedContact[] {
  return contacts.filter((c) => {
    if (
      filters.company &&
      !c.company_name.toLowerCase().includes(filters.company.toLowerCase())
    )
      return false;
    if (filters.lifecycleStage && c.lifecycle_stage !== filters.lifecycleStage)
      return false;
    if (filters.leadScoreMin != null && c.lead_score < filters.leadScoreMin)
      return false;
    if (filters.leadScoreMax != null && c.lead_score > filters.leadScoreMax)
      return false;
    if (filters.status && c.status !== filters.status) return false;
    return true;
  });
}

export function getContactsByCompany(companyName: string): {
  contacts: EnrichedContact[];
  stats: {
    total: number;
    hot: number;
    warm: number;
    cold: number;
    inContract: number;
  };
} {
  const companyContacts = contacts.filter(
    (c) => c.company_name.toLowerCase() === companyName.toLowerCase(),
  );
  return {
    contacts: companyContacts,
    stats: {
      total: companyContacts.length,
      hot: companyContacts.filter((c) => c.status === "hot").length,
      warm: companyContacts.filter((c) => c.status === "warm").length,
      cold: companyContacts.filter((c) => c.status === "cold").length,
      inContract: companyContacts.filter((c) => c.status === "in-contract")
        .length,
    },
  };
}

export function getTopLeads(limit: number = 10): EnrichedContact[] {
  return [...contacts]
    .sort((a, b) => b.lead_score - a.lead_score)
    .slice(0, limit);
}

export function updateContactForecast(
  id: number,
  update: { renewal_forecast_category?: string; renewal_probability?: number },
): EnrichedContact | undefined {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return undefined;
  if (update.renewal_forecast_category != null)
    contact.renewal_forecast_category = update.renewal_forecast_category;
  if (update.renewal_probability != null)
    contact.renewal_probability = update.renewal_probability;
  return contact;
}
