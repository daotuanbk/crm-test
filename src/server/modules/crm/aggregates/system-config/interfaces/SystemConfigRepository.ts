import { Repository, FindResult } from '@app/core';
import { SystemConfig, FindSystemConfigQuery } from '@app/crm';

export interface SystemConfigRepository extends Repository<SystemConfig> {
  find: (query: FindSystemConfigQuery) => Promise<FindResult<SystemConfig>>;
  init: () => Promise<void>;
  initFbAccessToken: (access_token: string, page_id: string) => Promise<void>;
  initFbCampaignAccessToken: (access_token: string) => Promise<void>;
  findLeadStageStatusByStageId: (id: string) => Promise<any>;
  findLeadStages: () => Promise<any>;
  findLeadStageStatus: () => Promise<any>;
  findLeadClassStages: () => Promise<any>;
  findLeadClassStageStatus: () => Promise<any>;
  findLeadContactStages: () => Promise<any>;
  findLeadContactStatuses: () => Promise<any>;
  findProspectingSources: () => Promise<any>;
  findFbAccessToken: () => Promise<SystemConfig>;
  findFbCampaignAccessToken: () => Promise<SystemConfig>;
  findOneByQuery: (query: any) => Promise<SystemConfig>;
  findContactStageByName: (name: string) => Promise<any>;
  findContactStatusByName: (name: string) => Promise<any>;
  findLeadStageByName: (name: string) => Promise<any>;
  findLeadStatusByName: (name: string) => Promise<any>;
  findClassStageByName: (name: string) => Promise<any>;
  findClassStatusByName: (name: string) => Promise<any>;
}
