import { Gender } from '@app/core';
import { LeadStatuses, LeadChannels, LeadSources, LeadCampaigns, LeadMediums } from '@app/crm';

// 3 cases:
//   - contactId empty => create a new contact with contactInfo => create new lead with that new contact
//   - contactId exist, contactInfo empty => use an existed contact to create lead
//   - contactId exists, contactInfo exists => override contact with contactInfo => create new lead with that contact

export interface CreateLeadPayload {
  overwrite: boolean;
  contactId?: string;
  contactInfo?: {
    fullName?: string;
    phoneNumber?: string;
    gender?: Gender;
    email?: string;
    address?: string;
    dob?: Date;
    facebook?: string;
    zalo?: string;
    school?: string;
  };
  leadInfo: {
    status?: LeadStatuses;
    channel: LeadChannels;
    source: LeadSources;
    campaign: LeadCampaigns;
    medium: LeadMediums;
    content?: string;
  };
}
