import { Repository, FindResult } from '@app/core';
import { EmailTemplateConfig, FindDetaulTaskQuery } from '@app/crm';

export interface EmailTemplateConfigRepository extends Repository<EmailTemplateConfig> {
  find: (query: FindDetaulTaskQuery) => Promise<FindResult<EmailTemplateConfig>>;
  findAll: () => Promise<any>;
  findByName: (payload: string) => Promise<EmailTemplateConfig | null>;
  convert: () => Promise<any>;
  findByIds: (ids: string[]) => Promise<EmailTemplateConfig[]>;
}
