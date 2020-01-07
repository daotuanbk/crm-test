import { FindQuery } from '@app/core';

export interface FindLmsClassQuery extends FindQuery {
  search?: string;
  lmsCourse?: string;
  limit?: number;
  page?: number;
}
