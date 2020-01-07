import {
  CreateLeadPayload,
  LeadRequestParams,
  leadRepository,
  LeadStatuses,
  contactRepository,
  LeadChannels,
  LeadSources,
  LeadCampaigns,
  LeadMediums,
  centreRepository,
  campaignRepository,
} from '@app/crm';
import { ensurePermission, validatePayload, GENDER_FEMALE, GENDER_MALE, GENDER_OTHER, removeEmpty } from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import { BadRequest } from '@feathersjs/errors';
import * as yup from 'yup';
import _ from 'lodash';
import { config } from '@app/config';
import { updateContactFamily } from '../helpers/updateContactFamily';
import { updateLeadCustomerFamily } from '../helpers/updateLeadCustomerFamily';
import { updateLeadsCustomer } from '../helpers/updateLeadsCustomer';
import { userRepository } from '@app/auth';

const createNewLead = async (contactInfo: any, newLeadInfo: any, authUser: any, creationInfo: any) => {
  const defaultOwner = {
    id: _.get(authUser, '_id', ''),
    fullName: _.get(authUser, 'fullName', ''),
    avatar: _.get(authUser, 'avatarUrl', ''),
  };

  const leadInfo: any = {
    owner: _.get(newLeadInfo, 'owner', defaultOwner),
    customer: {
      _id: contactInfo._id,
      fullName: contactInfo.fullName,
      phoneNumber: contactInfo.phoneNumber,
      email: contactInfo.email,
      family: contactInfo.family,
    },
    v2Status: newLeadInfo.status || LeadStatuses.L1A,
    ...newLeadInfo,
    ...creationInfo,
  };
  if (newLeadInfo.centre) {
    leadInfo.centre = newLeadInfo.centre;
  } else if (_.get(authUser, 'centreId._id')) {
    leadInfo.centre = {
      _id: _.get(authUser, 'centreId._id', ''),
      name: _.get(authUser, 'centreId.name', ''),
      shortName: _.get(authUser, 'centreId.shortName', ''),
    };
  }

  return await leadRepository.create(leadInfo);
};

export const validateLeadInfo = async (data: CreateLeadPayload) => {
  const inputData = removeEmpty(data);
  let existedContact: any;

  await validatePayload({
    overwrite: yup.bool().nullable(true),
    contactId: yup.string().nullable(true)
      .test('Existed Contact', '[Customer] Contact didnt exist', async (value: string) => {
        if (!value) {
          return true;
        }
        existedContact = await contactRepository.findById(value);
        return !!existedContact;
      }),
    contactInfo: yup.object()
      .shape({
        fullName: yup.string().nullable(true),
        phoneNumber: yup.string().nullable(true)
          .matches(config.regex.phone, '[Customer] Invalid phone number')
          .test('Phone number available', '[Customer] A contact exist with this phone number', async (value: string) => {
            if (inputData.contactId) {
              return true;
            }
            const existedPhoneNumber = await contactRepository.findOne({phoneNumber: value});
            return !existedPhoneNumber;
          }),
        gender: yup.string().nullable(true)
          .oneOf(['', GENDER_FEMALE, GENDER_MALE, GENDER_OTHER], '[Customer] Invalid gender'),
        email: yup.string().nullable(true)
          .matches(config.regex.email, '[Customer] Invalid email address'),
        address: yup.string().nullable(true),
        dob: yup.string().nullable(true),
        facebook: yup.string().nullable(true),
        zalo: yup.string().nullable(true),
        school: yup.string().nullable(true),
      })
      .nullable(true),
    leadInfo: yup.object().shape({
      status: yup.string().nullable(true)
        .oneOf([
          LeadStatuses.L0A,
          LeadStatuses.L0B,
          LeadStatuses.L1A,
          LeadStatuses.L1B,
          LeadStatuses.L1C,
          LeadStatuses.L2A,
          LeadStatuses.L2B,
          LeadStatuses.L2C,
          LeadStatuses.L2D,
          LeadStatuses.L2E,
          LeadStatuses.L2F,
          LeadStatuses.L2G,
          LeadStatuses.L2X,
          LeadStatuses.L3A,
          LeadStatuses.L3B,
          LeadStatuses.L3C,
          LeadStatuses.L4A,
          LeadStatuses.L4B,
          LeadStatuses.L4X,
          LeadStatuses.L5A,
          LeadStatuses.L5B,
          LeadStatuses.L5C,
        ], 'Invalid lead status'),
      channel: yup.string()
        .required('Please select channel')
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
      source: yup.string()
        .required('Please select source')
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
      campaign: yup.string()
        .required('Please select campaign')
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
      medium: yup.string().required('Please select medium')
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
          const existedCampaign = await campaignRepository.findById(value); // Temporily use campaign repo
          return !!existedCampaign;
        }),
      centre: yup.string().nullable(true)
        .test('Existed centre', 'Centre not found', async (value: string) => {
          if (!value) {
            return true;
          }

          const existedCentre = await centreRepository.findOne({ name: { $regex: `${value}`, $options: 'i' } });
          if (existedCentre) {
            inputData.leadInfo.centre = {
              _id: _.get(existedCentre, '_id', ''),
              name: _.get(existedCentre, 'name', ''),
              shortName: _.get(existedCentre, 'shortName', ''),
            };
          }
          return !!existedCentre;
        }),
      salesman: yup.string().nullable(true)
        .test('Existed salesman', 'Salesman not found', async (value: string) => {
          if (!value) {
            return true;
          }

          const existedSalesman = await userRepository.findOne({ email: value });
          if (existedSalesman) {
            inputData.leadInfo.owner = {
              id: _.get(existedSalesman, '_id', ''),
              fullName: _.get(existedSalesman, 'fullName', ''),
              avatar: _.get(existedSalesman, 'avatarUrl', ''),
            };
          }
          return !!existedSalesman;
        }),
    }),
  }, inputData);

  return {
    inputData,
    existedContact,
  };
};

export const execCreateLead = async (inputData: CreateLeadPayload, existedContact: any, authUser: any, creationInfo: any) => {
  // 3. business logic
  if (inputData.contactId) {
    // 3.1 if payload contain contactId => use an existed Contact for this Lead
    // 3.1.1 if this contact already has an active Lead => Reject create Lead
    const activeLead = await leadRepository.findOne({
      'v2Status': {$ne: LeadStatuses.L5C},
      'customer._id': inputData.contactId,
    });
    if (activeLead) {
      throw new BadRequest('This contact is having an active lead');
    }

    // 3.1.2 if this contact dont have any active Lead => update Contact if neccessary + create new Lead
    if (inputData.overwrite && inputData.contactInfo) {
      const contactInfo = {
        id: inputData.contactId,
        ...inputData.contactInfo,
      };
      const newContactInfo = await contactRepository.update(contactInfo);
      await Promise.all([
        updateLeadsCustomer(newContactInfo),
        updateContactFamily(newContactInfo),
        updateLeadCustomerFamily(newContactInfo),
      ]);

      return await createNewLead(newContactInfo, inputData.leadInfo, authUser, creationInfo);
    } else {
      return await createNewLead(existedContact, inputData.leadInfo, authUser, creationInfo);
    }
  } else {
    // 3.2 if payload dont contain contactId => create a new Contact => use the new Contact to create a new Lead
    // 3.2.1 create new contact
    const newContactInfo = {
      ...inputData.contactInfo,
      ...creationInfo,
    };
    const newContact: any = await contactRepository.create(newContactInfo);

    // 3.2.1 create lead
    return await createNewLead(newContact, inputData.leadInfo, authUser, creationInfo);
  }
};

export const create: any = async (data: CreateLeadPayload, params: LeadRequestParams) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.LEADS.CREATE);

  // 1. validate
  const { inputData, existedContact } = await validateLeadInfo(data);

  // 2. business logic
  return await execCreateLead(inputData, existedContact, params.authUser, params.creationInfo);
};
