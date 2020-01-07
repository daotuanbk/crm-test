import { RequestParams, Service } from '@app/core';
import { Campaign, FindCampaignQuery, CampaignRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface CampaignService extends Service<Campaign, FindCampaignQuery, CampaignRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<Campaign>, params: RequestParams<CampaignRepository>) => Promise<{}>;
  getAllRecord: (params: RequestParams<CampaignRepository>) => Promise<any>;
}
