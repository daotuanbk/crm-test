import { RequestParams } from '@app/core';

export interface WebhooksService {
  find?: (params: any) => Promise<number>;
  create: (data?: any, params?: RequestParams<any>) => Promise<string>;
}
