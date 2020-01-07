import { FindQuery } from '@app/core';

export interface FindProductCourseQuery extends FindQuery {
  search?: string;
  filter?: any;
}
