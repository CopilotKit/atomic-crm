import Papa from "papaparse";
import {
  random,
  lorem,
  address,
  internet,
  phone,
  datatype,
} from "faker/locale/en_US";
import type { Company, Contact, RAFile } from "../../../types";
import type { Db } from "./types";
import { defaultCompanySectors } from "../../../root/defaultConfiguration";
import { generateSales } from "./sales";
import { generateTags } from "./tags";
import { generateContactNotes } from "./contactNotes";
import { generateDeals } from "./deals";
import { generateDealNotes } from "./dealNotes";
import { generateTasks } from "./tasks";
import { finalize } from "./finalize";
import csvText from "../../../../../../test-data/contacts_demo_v2.csv?raw";

interface CsvRow {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  title: string;
  background: string;
  first_seen: string;
  last_seen: string;
  has_newsletter: string;
  status: string;
  tags: string;
  company_id: string;
  sales_id: string;
  linkedin_url: string;
  company_name: string;
  nb_tasks: string;
  company: string;
  email_work: string;
  email_home: string;
  email_other: string;
  phone_work: string;
  phone_home: string;
  phone_other: string;
}

export function generateFromCsv(): Db {
  const db = {} as Db;

  // Generate sales and tags normally (these aren't in the CSV)
  db.sales = generateSales(db);
  db.tags = generateTags(db);

  // Parse CSV
  const result = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  const rows = result.data;

  // Extract unique companies
  const companyMap = new Map<number, { id: number; name: string }>();
  for (const row of rows) {
    const companyId = parseInt(row.company_id, 10);
    if (companyId && !companyMap.has(companyId)) {
      companyMap.set(companyId, {
        id: companyId,
        name: row.company_name || row.company || "",
      });
    }
  }

  // Build companies array
  const regex = /\W+/;
  db.companies = Array.from(companyMap.values()).map(
    ({ id, name }): Required<Company> => ({
      id,
      name,
      logo: {
        title: name,
        src: `https://marmelab.com/react-admin-crm/logos/${id % 55}.png`,
      } as RAFile,
      sector: random.arrayElement(defaultCompanySectors).value,
      size: random.arrayElement([10, 50, 250, 500]) as 1 | 10 | 50 | 250 | 500,
      linkedin_url: `https://www.linkedin.com/company/${name.toLowerCase().replace(regex, "_")}`,
      website: internet.url(),
      phone_number: phone.phoneNumber(),
      address: address.streetAddress(),
      zipcode: address.zipCode(),
      city: address.city(),
      state_abbr: address.stateAbbr(),
      nb_contacts: rows.filter((r) => parseInt(r.company_id, 10) === id).length,
      nb_deals: 0,
      sales_id: datatype.number(2) === 0 ? 0 : random.arrayElement(db.sales).id,
      created_at: new Date(
        Date.now() - 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      description: lorem.paragraph(),
      revenue: random.arrayElement(["$1M", "$10M", "$100M", "$1B"]),
      tax_identifier: random.alphaNumeric(10),
      country: random.arrayElement(["USA", "France", "UK"]),
      context_links: [],
    }),
  );

  // Build contacts array
  db.contacts = rows.map((row): Required<Contact> => {
    const emails = [];
    if (row.email_work)
      emails.push({ email: row.email_work, type: "Work" as const });
    if (row.email_home)
      emails.push({ email: row.email_home, type: "Home" as const });
    if (row.email_other)
      emails.push({ email: row.email_other, type: "Other" as const });

    const phones = [];
    if (row.phone_work)
      phones.push({ number: row.phone_work, type: "Work" as const });
    if (row.phone_home)
      phones.push({ number: row.phone_home, type: "Home" as const });
    if (row.phone_other)
      phones.push({ number: row.phone_other, type: "Other" as const });

    const id = parseInt(row.id, 10);

    return {
      id,
      first_name: row.first_name || "",
      last_name: row.last_name || "",
      gender: row.gender || "male",
      title: row.title || "",
      company_id: parseInt(row.company_id, 10) || null,
      company_name: row.company_name || row.company || "",
      email_jsonb:
        emails.length > 0 ? emails : [{ email: "", type: "Work" as const }],
      phone_jsonb: phones.length > 0 ? phones : [],
      background: row.background || "",
      avatar: {
        src:
          id <= 223
            ? `https://marmelab.com/posters/avatar-${id}.jpeg`
            : undefined,
      },
      first_seen: row.first_seen || new Date().toISOString(),
      last_seen: row.last_seen || new Date().toISOString(),
      has_newsletter: row.has_newsletter === "True",
      status: row.status || "cold",
      tags: [],
      sales_id: parseInt(row.sales_id, 10) || 0,
      nb_tasks: parseInt(row.nb_tasks, 10) || 0,
      linkedin_url: row.linkedin_url || null,
    };
  });

  // Generate the rest normally (notes, deals, tasks)
  db.contact_notes = generateContactNotes(db);
  db.deals = generateDeals(db);
  db.deal_notes = generateDealNotes(db);
  db.tasks = generateTasks(db);
  db.configuration = [
    { id: 1, config: {} as Db["configuration"][number]["config"] },
  ];
  finalize(db);

  return db;
}
