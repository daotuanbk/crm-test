import { Repository, FindResult } from '@app/core';
import { MappingContactInfo, FindMappingContactInfoQuery } from '@app/crm';

export interface MappingContactInfoRepository extends Repository<MappingContactInfo> {
  find: (query: FindMappingContactInfoQuery) => Promise<FindResult<MappingContactInfo>>;
  findAll: () => Promise<any>;
  findAndCreate: (payload: any) => Promise<any>;
  findAllByKey: (email: string, phone: string, nameObj?: any) => Promise<any>;
  updateRefId: (oldId: string, newId: string) => Promise<void>;
  findTuitions: (query: any) => Promise<any>;
  deleteAll: () => Promise<void>;
  deleteByRootId: (id: string) => Promise<void>;
}
