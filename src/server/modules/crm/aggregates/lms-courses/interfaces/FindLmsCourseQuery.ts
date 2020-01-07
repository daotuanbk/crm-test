import { FindQuery } from '@app/core';

export interface FindLmsCourseQuery extends FindQuery {
  search?: string;
  limit?: number;
  page?: number;
}
