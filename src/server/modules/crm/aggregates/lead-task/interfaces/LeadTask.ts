import { Aggregate, IsAuditable } from '@app/core';

export interface LeadTask extends Aggregate, IsAuditable {
  leadId: string;
  assigneeId: string;
  title: string;
  dueAt: number;
  status: number;
  finishedAt: number;
}
