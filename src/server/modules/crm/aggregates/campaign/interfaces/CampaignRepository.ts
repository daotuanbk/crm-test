import { Repository, FindResult } from '@app/core';
import { Campaign, FindCampaignQuery } from '@app/crm';

export interface CampaignRepository extends Repository<Campaign> {
  find: (query: FindCampaignQuery) => Promise<FindResult<Campaign>>;
  findAll: () => Promise<FindResult<Campaign>>;
  findByQuery: (query: any) => Promise<any>;
}
