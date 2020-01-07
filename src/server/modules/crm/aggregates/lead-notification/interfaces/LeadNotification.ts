import { Aggregate, IsAuditable } from '@app/core';

export interface LeadNotification extends Aggregate, IsAuditable {
  leadId: string;
  isSeen: boolean;
  content: string;
  type: number;
  objectId: string;
  objectType: string;
}
