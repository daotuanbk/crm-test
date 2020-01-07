import { Repository, FindResult } from '@app/core';
import { ProductCourse, FindProductCourseQuery } from '@app/crm';

export interface ProductCourseRepository extends Repository<ProductCourse> {
  find: (query: FindProductCourseQuery) => Promise<FindResult<ProductCourse>>;
  findAll: () => Promise<ProductCourse[]>;
  init: () => Promise<any>;
  synchronize: (data: any) => Promise<void>;
}
