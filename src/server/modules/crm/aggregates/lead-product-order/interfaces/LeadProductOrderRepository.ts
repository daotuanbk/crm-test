import { Repository, FindResult } from '@app/core';
import { LeadProductOrder, FindLeadProductOrderQuery } from '@app/crm';

export interface LeadProductOrderRepository extends Repository<LeadProductOrder> {
  find: (query: FindLeadProductOrderQuery) => Promise<FindResult<LeadProductOrder>>;
  findByIdPopulateLead: (query: string) => Promise<any>;
  updateField: (criteria: any, payload: any) => Promise<any>;
  updateCourses: (_id: string, payload: any, noCallback?: boolean) => Promise<any>;
  deleteCourse: (_id: string, payload: any) => Promise<any>;
  addCourse: (_id: string, payload: any) => Promise<any>;
  addCombo: (_id: string, payload: any) => Promise<any>;
  updateCombo: (payload: any) => Promise<any>;
  deleteCombo: (_id: string) => Promise<any>;
  removeCombo: (_id: string) => Promise<any>;
}
