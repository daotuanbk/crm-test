import { Aggregate, IsAuditable } from '@app/core';

export interface LeadMessageDetail extends Aggregate, IsAuditable {
  conversationId: string;
  direction: number;
  content: string;
  html: string;
  channel: string;
  ownerId: string | any;
}
