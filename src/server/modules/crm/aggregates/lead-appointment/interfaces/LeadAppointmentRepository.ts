import { Repository, FindResult } from '@app/core';
import { LeadAppointment, FindLeadAppointmentQuery } from '@app/crm';

export interface LeadAppointmentRepository extends Repository<LeadAppointment> {
  find: (query: FindLeadAppointmentQuery) => Promise<FindResult<LeadAppointment>>;
  findAll: () => Promise<any>;
  findByLeadId: (leadId: string) => Promise<any>;
  findOverdueRecords: () => Promise<LeadAppointment[]>;
}
