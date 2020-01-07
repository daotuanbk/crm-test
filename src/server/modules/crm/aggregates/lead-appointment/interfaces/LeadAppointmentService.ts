import { FindResult, RequestParams, Service } from '@app/core';
import { LeadAppointment, FindLeadAppointmentQuery, LeadAppointmentRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface LeadAppointmentService extends Service<LeadAppointment, FindLeadAppointmentQuery, LeadAppointmentRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<LeadAppointment>, params: RequestParams<LeadAppointmentRepository>) => Promise<{}>;
  getByLeadId: (params: RequestParams<LeadAppointmentRepository> & { query: FindLeadAppointmentQuery }) => Promise<FindResult<LeadAppointment>>;
}
