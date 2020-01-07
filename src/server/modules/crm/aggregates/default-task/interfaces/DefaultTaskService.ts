import { RequestParams, Service } from '@app/core';
import { DefaultTask, FindDetaulTaskQuery, DefaultTaskRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface DefaultTaskService extends Service<DefaultTask, FindDetaulTaskQuery, DefaultTaskRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<DefaultTask>, params: RequestParams<DefaultTaskRepository>) => Promise<{}>;
}
