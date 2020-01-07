import { Service, RequestParams } from '@app/core';
import { Application } from '@feathersjs/express';
import { LeadFilter, FindLeadFiltersQuery, LeadFiltersRepository } from '@app/crm';

export interface LeadFiltersService extends Service<LeadFilter, FindLeadFiltersQuery, LeadFiltersRepository> {
  setup?: (app: Application<any>, path: string) => void;
  checkFilterName: (req: any, res: any) => void;
  getAllRecords: (params: RequestParams<LeadFiltersRepository>) => Promise<{data: any[]}>;
}
