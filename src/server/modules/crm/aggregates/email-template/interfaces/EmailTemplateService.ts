import { RequestParams, Service } from '@app/core';
import { EmailTemplate, FindDetaulTaskQuery, EmailTemplateRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface EmailTemplateService extends Service<EmailTemplate, FindDetaulTaskQuery, EmailTemplateRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<EmailTemplate>, params: RequestParams<EmailTemplateRepository>) => Promise<{}>;
}
