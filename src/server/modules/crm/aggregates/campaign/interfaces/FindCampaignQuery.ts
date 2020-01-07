import { FindQuery } from '@app/core';

export interface FindCampaignQuery extends FindQuery {
  search?: string;
  filter?: any;
}
