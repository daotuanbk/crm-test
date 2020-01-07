import { Query } from '@app/core';
import { LeadNote, FindLeadNoteQuery } from '@app/crm';

export interface LeadNoteRepository {
  findById: (id: string) => Promise<LeadNote>;
  findOne: (query: Query) => Promise<LeadNote>;
  find: (query: FindLeadNoteQuery) => Promise<any>;
  count: (query: Query) => Promise<number>;
  create: (entity: LeadNote) => Promise<string>;
  update: (entity: Partial<LeadNote>) => Promise<void>;
  del: (id: string) => Promise<void>;
  ensureIndexes: () => Promise<void>;
  delByCriteria: (criteria: any) => Promise<any>;
  findByLeadOrContactId: (leadId?: string, contactId?: string) => Promise<any>;
}
