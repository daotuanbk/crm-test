import { Repository, FindResult } from '@app/core';
import { RootContact, FindDetaulTaskQuery } from '@app/crm';

export interface RootContactRepository extends Repository<RootContact> {
  find: (query: FindDetaulTaskQuery) => Promise<FindResult<RootContact>>;
  findAll: () => Promise<any>;
  findByEmail: (email: string) => Promise<any>;
  findByFbConversationId: (fbConversationId: string) => Promise<any>;
  synchronize: (id: string, payload: any, indexes?: any) => Promise<any>;
  manualSynchronize: (id: string, payload: any) => Promise<any>;
  findInArrayId: (payload: any) => Promise<any>;
  updateLmsStudentId: (ids: any, studentId: string, payload?: any) => Promise<any>;
  updateEmailAndPhone: () => Promise<void>;
  findByStudentId: (id: string) => Promise<any>;
  syncDataFromLms: (criteria: any, payload: any) => Promise<void>;
  updateOne: (criteria: any, payload: any) => Promise<any>;
  mergeRootContacts: (payload: any) => Promise<void>;
}
