import { Aggregate, IsAuditable } from '@app/core';

export interface LeadAttachment extends Aggregate, IsAuditable {
  title: string;
  url: string;
  leadId: string;
  createdAt: number;
  createdBy: string;
}
