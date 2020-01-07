import { Aggregate, IsAuditable } from '@app/core';

export type LeadFilterOperator = '=='|'>='|'<='|'>'|'<'|'array_contains';

export interface LeadFilter extends Aggregate, IsAuditable {
  _id: string;
  name: string;
  owner: any;
  search: string;
  filters: {
    fieldName: string;
    operator: LeadFilterOperator;
    value: any;
  }[];
}
