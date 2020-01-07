import { FindQuery } from '@app/core';

export interface FindLeadAppointmentQuery extends FindQuery {
  search?: string;
  filter?: any;
  leadId?: string;
}
