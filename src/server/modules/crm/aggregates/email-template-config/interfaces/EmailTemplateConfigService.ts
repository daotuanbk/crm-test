import { RequestParams, Service } from '@app/core';
import { EmailTemplateConfig, FindDetaulTaskQuery, EmailTemplateConfigRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface EmailTemplateConfigService extends Service<EmailTemplateConfig, FindDetaulTaskQuery, EmailTemplateConfigRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<EmailTemplateConfig>, params: RequestParams<EmailTemplateConfigRepository>) => Promise<{}>;
}
