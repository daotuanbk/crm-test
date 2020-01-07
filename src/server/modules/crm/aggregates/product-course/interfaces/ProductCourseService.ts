import { RequestParams, Service } from '@app/core';
import { ProductCourse, FindProductCourseQuery, ProductCourseRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface ProductCourseService extends Service<ProductCourse, FindProductCourseQuery, ProductCourseRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<ProductCourse>, params: RequestParams<ProductCourseRepository>) => Promise<{}>;
  getAllRecords: (params: RequestParams<ProductCourseRepository>) => Promise<{data: any[]}>;
  synchronize: () => Promise<any>;
}
