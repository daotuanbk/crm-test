import { LmsCategoryRepository, LmsCategory } from '@app/crm';
import { Service, FindQuery } from '@app/core';

export interface LmsCategoryService
  extends Service<LmsCategory, FindQuery, LmsCategoryRepository> {}
