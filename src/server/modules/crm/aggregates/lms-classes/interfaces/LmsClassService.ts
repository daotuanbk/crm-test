import { Service } from '@app/core';
import { LmsClass, FindLmsClassQuery, LmsClassRepository } from '@app/crm';

export interface LmsClassService extends Service<LmsClass, FindLmsClassQuery, LmsClassRepository> {}
