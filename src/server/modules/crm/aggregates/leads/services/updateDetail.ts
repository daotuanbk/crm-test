import { LeadRequestParams, LeadChannels, LeadSources, LeadCampaigns, leadRepository, LeadMediums, campaignRepository } from '@app/crm';
import { ensurePermission, removeEmpty, validatePayload } from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';

export const updateDetail = async (id: string, data: any, params: LeadRequestParams) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.LEADS.EDIT);

  // 2. validate
  const inputData = removeEmpty(data);
  await validatePayload({
    id: yup.string().required('Lead ID must be specified')
      .test('Existed Lead', 'Lead not found', async (value: string) => {
        const existedLead = await leadRepository.findById(value);
        return !!existedLead;
      }),
    channel: yup.string().nullable(true)
      .oneOf([
        LeadChannels.Database,
        LeadChannels.Email,
        LeadChannels.EventOffline,
        LeadChannels.Fanpage,
        LeadChannels.Native,
        LeadChannels.Other,
        LeadChannels.Referral,
        LeadChannels.SelfCreated,
        LeadChannels.Social,
        LeadChannels.Website,
      ], 'Invalid channel'),
    source: yup.string().nullable(true)
      .oneOf([
        LeadSources.Ads,
        LeadSources.Coccoc,
        LeadSources.Direct,
        LeadSources.DirectSale,
        LeadSources.EmailAds,
        LeadSources.EmailMarketing,
        LeadSources.EventOffline,
        LeadSources.Hotline,
        LeadSources.Instagram,
        LeadSources.None,
        LeadSources.Organic,
        LeadSources.Referral,
        LeadSources.Resales,
        LeadSources.Site,
        LeadSources.Telemarketing,
        LeadSources.Youtube,
        LeadSources.Zalo,
      ], 'Invalid source'),
    campaign: yup.string().nullable(true)
      .oneOf([
        LeadCampaigns.Ads,
        LeadCampaigns.Browserskin,
        LeadCampaigns.Bumper15,
        LeadCampaigns.Bumper6,
        LeadCampaigns.Comment,
        LeadCampaigns.Conversion,
        LeadCampaigns.Display,
        LeadCampaigns.Inbox,
        LeadCampaigns.Instream,
        LeadCampaigns.Lead,
        LeadCampaigns.Mess,
        LeadCampaigns.Newtab,
        LeadCampaigns.None,
        LeadCampaigns.Outstream,
        LeadCampaigns.PR,
        LeadCampaigns.ParentRefer,
        LeadCampaigns.PostEngage,
        LeadCampaigns.SaleContact,
        LeadCampaigns.Search,
        LeadCampaigns.StudentRefer,
        LeadCampaigns.CTW,
      ], 'Invalid campaign'),
    medium: yup.string().nullable(true)
      .oneOf([
        LeadMediums.Banner,
        LeadMediums.Chat,
        LeadMediums.ColdData,
        LeadMediums.Cpc,
        LeadMediums.Cpd,
        LeadMediums.Cpm,
        LeadMediums.Form,
        LeadMediums.Funnel,
        LeadMediums.Keyword,
        LeadMediums.Landing,
        LeadMediums.None,
        LeadMediums.Video,
      ], 'Invalid medium'),
    content: yup.string().nullable(true)
      .test('Existed content', 'Content not found', async (value) => {
        if (!value) return true;
        const existedCampaign = await campaignRepository.findById(value);
        return !!existedCampaign;
      }),
  }, {
    id,
    ...inputData,
  });

  // 3. update db
  return await leadRepository.update({
    id,
    ...inputData,
    ...params.modificationInfo,
  });
};
