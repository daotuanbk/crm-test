import { Service, RequestParams } from '@app/core';
import { Lead, FindLeadsQuery, LeadsRepository } from '@app/crm';
import { Application } from '@feathersjs/express';
import {  } from './CreateLeadPayload';

export interface LeadsService extends Service<Lead, FindLeadsQuery, LeadsRepository> {
  setup: (app: Application<any>, path: string) => void;
}

export type LeadRequestParams = RequestParams<LeadsRepository>;
