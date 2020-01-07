import { Repository, FindResult } from '@app/core';
import { EmailTemplate, FindDetaulTaskQuery } from '@app/crm';

export interface EmailTemplateRepository extends Repository<EmailTemplate> {
  find: (query: FindDetaulTaskQuery) => Promise<FindResult<EmailTemplate>>;
  findAll: () => Promise<any>;
  findByName: (payload: string) => Promise<EmailTemplate | null>;
}
