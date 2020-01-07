import { Repository, FindResult } from '@app/core';
import { LeadNotification, FindDetaulTaskQuery } from '@app/crm';

export interface LeadNotificationRepository extends Repository<LeadNotification> {
  find: (query: FindDetaulTaskQuery) => Promise<FindResult<LeadNotification>>;
  findAll: () => Promise<any>;
  findByObjectIds: (objectIds: string[]) => Promise<LeadNotification[]>;
  countUnseen: (query: any) => Promise<number>;
  seen: (criteria: any) => Promise<boolean>;
  check: (id: string) => Promise<boolean>;
}
