import { FindResult, RequestParams, Service } from '@app/core';
import {
  LeadNote,
  FindLeadNoteQuery,
  LeadNoteRepository,
} from '@app/crm';
import { Application } from '@feathersjs/express';

export interface LeadNoteService extends Service<LeadNote, FindLeadNoteQuery, LeadNoteRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<LeadNote>, params: RequestParams<LeadNoteRepository>) => Promise<{}>;
  getByLeadOrContactId: (params: RequestParams<LeadNoteRepository> & { query: FindLeadNoteQuery }) => Promise<FindResult<LeadNote>>;
}
