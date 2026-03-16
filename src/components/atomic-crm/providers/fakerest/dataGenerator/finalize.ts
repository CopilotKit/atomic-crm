import type { Db } from "./types";

export const finalize = (db: Db) => {
  // set contact status according to the latest note
  const contactById = new Map(db.contacts.map((c) => [c.id, c]));
  db.contact_notes
    .sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf())
    .forEach((note) => {
      const contact = contactById.get(note.contact_id as number);
      if (contact) {
        contact.status = note.status;
      }
    });
};
