import { WebhooksService } from './interfaces/WebhooksService';
import {
  EntityNotFoundError,
  LEAD_CONVERSATION_FBCHAT,
  LEAD_MESSAGE_DETAIL_DIRECTION_OUT,
  LEAD_NOTIFICATION_TYPE_FBMESSAGE,
  logger,
  NotAuthorizedError, PROSPECTING_LIST_SOURCE_FACEBOOK_CAMPAIGN,
  PROSPECTING_LIST_SOURCE_FBCHAT,
  RequestParams,
} from '@app/core';
import { config } from '@app/config';
import { webhooksRepository } from './webhooks.repository';
import axios from 'axios';
import cache from 'memory-cache';

import {
  campaignRepository,
  contactRepository,
  leadConversationRepository,
  leadMessageDetailRepository,
  leadNotificationRepository,
  leadRepository,
  prospectingListRepository,
  systemConfigRepository,
} from '@app/crm';
import moment from 'moment';

const LOGGER_NAME = '[Webhook-FB]';
const CACHE_NAME = 'FB-CONVERSATION-';

interface WebhooksData {
  object: string;
  entry: {
    id: string,
    time: number,
    changes: {
      value: {
        page_id: number,
        thread_id: string,
        scoped_thread_key: string,
      },
      field: string;
    }[],
  };
}

interface WebhooksDataDetail {
  object: string;
  entry: {
    id: string,
    time: number,
    messaging: {
      sender: {
        id: string,
      },
      recipient: {
        id: string,
      },
      timestamp: number,
      message: {
        mid: string,
        seq: number,
        text: string,
      },
    }[],
  };
}

const ACCESS_TOKEN = {
  //
};

const getAccessToken = async (pageId: string) => {
  if (ACCESS_TOKEN[pageId]) return ACCESS_TOKEN[pageId];
  const systemConfig = (await systemConfigRepository.findOneByQuery({
    'value.page_id': pageId,
  }) as any).value;
  ACCESS_TOKEN[pageId] = {
    access_token: systemConfig.access_token,
    page_id: pageId,
  };
  return ACCESS_TOKEN[pageId];
};

const generateNameObject = (fullName: string) => {
  let lastName = '';
  let firstName = '';
  const split = fullName.split(' ');
  if (split && split.length) {
    firstName = split[split.length - 1];
    lastName = split.slice(0, split.length - 1).join(' ');
  }
  return {
    firstName,
    lastName,
    fullName,
  };
};

const conversationCallback = async (data: WebhooksData | WebhooksDataDetail) => {
  const {thread_id} = data.entry[0].changes[0].value;
  const valuedCache = cache.get(CACHE_NAME + thread_id);
  if (valuedCache) return;
  cache.put(CACHE_NAME + thread_id, {}, 2000);
  const pageId = data.entry[0].id;
  const fbConfig = await getAccessToken(pageId);
  let name;
  let id;
  let link;
  const conversations = await axios({
    url: `https://graph.facebook.com/me?fields=conversations.limit(10){id,senders,link}`,
    method: 'get',
    params: {
      access_token: fbConfig.access_token,
    },
  }) as any;
  const {data: dataConversations} = conversations.data.conversations;
  for (const i in dataConversations) {
    if (dataConversations[i].id === thread_id) {
      name = dataConversations[i].senders.data[0].name;
      id = dataConversations[i].senders.data[0].id;
      link = dataConversations[i].link;
      break;
    }
  }
  const leadFbConversation = await createContact(name, thread_id, id, link, fbConfig);
  await createLeadMessageDetail(thread_id, data.entry[0].id, fbConfig.access_token, leadFbConversation);
  cache.del(CACHE_NAME + thread_id);
};

const conversationCallbackWithMessaging = async (data: WebhooksData | WebhooksDataDetail, info: {
  thread_id: string;
  name: string;
  id: string;
  link: string;
}) => {
  const pageId = data.entry[0].id;
  const fbConfig = await getAccessToken(pageId);
  const { thread_id, name, id, link } = info;
  const valuedCache = cache.get(CACHE_NAME + thread_id);
  if (valuedCache) return;
  cache.put(CACHE_NAME + thread_id, {}, 2000);
  const leadFbConversation = await createContact(name, thread_id, id, link, fbConfig);
  await createLeadMessageDetail(thread_id, data.entry[0].id, fbConfig.access_token, leadFbConversation);
  cache.del(CACHE_NAME + thread_id);
};

const getFbLink = async (link: string, pageId: string) => {
  if (!link) return '';
  return '/' + pageId + '/' + link.replace(/\/(.+?)\//, '');
};

const createContact = async (name: string, thread_id: string, userId: string, link: string, fbConfig: any) => {
  logger.info(`${LOGGER_NAME} Check prospectingList`);
  const prospectingList = await getProspectingList(userId, fbConfig);
  logger.info(`${LOGGER_NAME} Find fbConversationId in prospectingContact, thread_id`, thread_id);
  let prospectingContact: any;
  if (!prospectingContact || !prospectingContact.length) {
    logger.info(`${LOGGER_NAME} Create new prospectingContact with fbConversationId: ${thread_id}, name: ${name}`);
    prospectingContact = {
      contactBasicInfo: {
        ...generateNameObject(name),
        fb: await getFbLink(link, fbConfig.page_id),
      },
      fbConversationId: thread_id,
      createdAt: moment().valueOf(),
      prospectingListId: `${prospectingList._id}`,
      ownerId: prospectingList.assigneeId,
      centre: prospectingList.centreId,
    } as any;
    prospectingContact._id = await contactRepository.create(prospectingContact);
  }
  else prospectingContact = prospectingContact[0];

  let leadFbConversation = await leadConversationRepository.getByContactId(`${prospectingContact._id}`) as any;
  if (!leadFbConversation) {
    logger.info(`[Email-conversations] Create LeadFbConversation`);
    leadFbConversation = {
      contactId: `${prospectingContact._id}`,
      channel: LEAD_CONVERSATION_FBCHAT,
      createdAt: moment().valueOf(),
      fbConversationId: thread_id,
      fbPageId: fbConfig.page_id,
    };
    leadFbConversation._id = await leadConversationRepository.create(leadFbConversation);
  }
  return leadFbConversation;
};

const getProspectingList = async (userId: string, fbConfig: any) => {
  let fbProspectingList = await prospectingListRepository.findByQuery({source: PROSPECTING_LIST_SOURCE_FBCHAT, pageId: fbConfig.page_id});
  if (!fbProspectingList) {
    const id = await prospectingListRepository.create({
      source: PROSPECTING_LIST_SOURCE_FBCHAT,
      pageId: fbConfig.page_id,
      name: 'fbchat',
      createdAt: moment().valueOf(),
    } as any);
    fbProspectingList = await prospectingListRepository.findById(id);
  }
  logger.info(`${LOGGER_NAME} Find user labels`, userId, fbConfig.page_id);
  const userLabels = await getUserCustomLabels(userId, fbConfig);
  const adIdObject = userLabels.find((userLabel: any) => {
    return userLabel.name.includes('ad_id.');
  });
  if (!adIdObject) return fbProspectingList;
  const adId = adIdObject.name.replace('ad_id.', '');
  logger.info(`${LOGGER_NAME} Find last campaign`, adId);
  const campaignFb = await getCampaignByAdId(adId, fbConfig);
  if (!campaignFb) return fbProspectingList;
  logger.info(`${LOGGER_NAME} Find campaign in system`);
  const campaign = await campaignRepository.findByQuery({adId: campaignFb.id});
  let prospectingList;
  if (!campaign) {
    logger.info(`${LOGGER_NAME} Create new campaign: ${campaignFb.name}`);
    const campaignId = await campaignRepository.create({
      sourceId: PROSPECTING_LIST_SOURCE_FACEBOOK_CAMPAIGN,
      name: campaignFb.name,
      order: 1,
      createdAt: moment().valueOf(),
      adId: campaignFb.id,
    } as any);
    logger.info(`${LOGGER_NAME} Create new prospecting list: ${campaignFb.name}`);
    const prospectingListId = await prospectingListRepository.create({
      source: PROSPECTING_LIST_SOURCE_FACEBOOK_CAMPAIGN,
      name: campaignFb.name,
      sourceName: campaignFb.name,
      campaignId,
      createdAt: moment().valueOf(),
    } as any);
    prospectingList = {
      _id: prospectingListId,
    };
  }

  if (prospectingList) return prospectingList;
  prospectingList = await prospectingListRepository.findByQuery({campaignId: campaign._id});
  if (!prospectingList) return fbProspectingList;
  return prospectingList;
};

const createLeadMessageDetail = async (thread_id: string, pageId: string, access_token: string, leadConversation: any) => {
  const lastMessage = await axios({
    url: `https://graph.facebook.com/${thread_id}?fields=messages.limit(4){message,from}`,
    method: 'get',
    params: {
      access_token,
    },
  }) as any;
  for (const i in lastMessage.data.messages.data) {
    if (pageId === lastMessage.data.messages.data[i].from.id) {
      logger.info(`${LOGGER_NAME} Message from page`);
    } else {
      const {message, id: messageId} = lastMessage.data.messages.data[i];
      const existed = await leadMessageDetailRepository.findByQuery({messageId});
      if (existed) return;
      const leadMessageDetail = {
        conversationId: leadConversation._id,
        content: message,
        createdAt: moment().valueOf(),
        channel: LEAD_CONVERSATION_FBCHAT,
        messageId,
      } as any;
      // if message from user
      leadMessageDetail.direction = LEAD_MESSAGE_DETAIL_DIRECTION_OUT;
      const id = await leadMessageDetailRepository.create(leadMessageDetail);
      logger.info(`${LOGGER_NAME} Create LeadMessageDetail: ${JSON.stringify(leadMessageDetail)}`);
      await createLeadNotification(id, message, leadConversation);
      return;
    }
  }
};

const createLeadNotification = async (id: string, message: string, leadConversation: any) => {
  const {leadId, contactId} = leadConversation;
  let ownerId;
  if (leadId) {
    const lead = await leadRepository.findById(leadId);
    if (lead.owner && lead.owner.id) ownerId = lead.owner.id;
  }

  const record = {
    leadId,
    contactId,
    ownerId,
    content: message,
    type: LEAD_NOTIFICATION_TYPE_FBMESSAGE,
    objectId: `${id}`,
    objectType: 'LeadMessageDetail',
    createdAt: moment().valueOf(),
  } as any;
  await leadNotificationRepository.create(record);
  logger.info(`${LOGGER_NAME} Create LeadNotification with message ${message}`);
};

const getUserCustomLabels = async (userId: string, fbConfig: any) => {
  try {
    const labels = await axios({
      url: `https://graph.facebook.com/${userId}/custom_labels?fields=name,id`,
      method: 'get',
      params: {
        access_token: fbConfig.access_token,
      },
    }) as any;
    if (labels && labels.data && labels.data.data) return labels.data.data;
  } catch (e) {
    logger.info(`${LOGGER_NAME} Error: ${e.message}`);
    //
  }
  return [];
};

const getCampaignByAdId = async (adId: string, fbConfig: any) => {
  const ad = await axios({
    url: `https://graph.facebook.com/v4.0/${adId}?fields=name,campaign_id`,
    method: 'get',
    params: {
      access_token: fbConfig.access_token,
    },
  }) as any;
  if (!ad || !ad.data || !ad.data.campaign_id) return null;
  const campaign = await axios({
    url: `https://graph.facebook.com/v4.0/${ad.data.campaign_id}?fields=name,id`,
    method: 'get',
    params: {
      access_token: fbConfig.access_token,
    },
  }) as any;
  if (campaign && campaign.data) return campaign.data;
  return null;
};

const getThreadId = async (data: WebhooksData | WebhooksDataDetail) => {
  if (!data.entry[0].messaging[0]) return;
  const senderId = data.entry[0].messaging[0].sender.id;
  const pageId = data.entry[0].id;
  const fbConfig = await getAccessToken(pageId);
  const senderName = await axios({
    url: `https://graph.facebook.com/v4.0/${senderId}?fields=name`,
    method: 'get',
    params: {
      access_token: fbConfig.access_token,
    },
  }) as any;
  const conversations = await axios({
    url: `https://graph.facebook.com/me?fields=conversations.limit(10){id, link, senders}`,
    method: 'get',
    params: {
      access_token: fbConfig.access_token,
    },
  }) as any;
  // tslint:disable-next-line
  let thread_id, name, id, link;
  const {data: dataConversations} = conversations.data.conversations;
  const selectedDataConversation = dataConversations.filter((dataItem: any) => {
    return dataItem && dataItem.senders && dataItem.senders.data &&
        dataItem.senders.data.filter((item: any) => item.name === (senderName && senderName.data && senderName.data.name)).length;
  })[0];
  if (selectedDataConversation) {
    thread_id = selectedDataConversation.id;
    name = senderName && senderName.data && senderName.data.name || 'Undefined';
    id = senderId;
    link = selectedDataConversation.link;
  }
  return {
    thread_id,
    name,
    id,
    link,
  };
};

const webhooksService: WebhooksService = {
  find: async (params: any) => {
    // Parse the query params
    const mode = params.query['hub.mode'];
    const token = params.query['hub.verify_token'];
    const challenge = params.query['hub.challenge'];
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === config.webhooks.verifyToken) {
        // Responds with the challenge token from the request
        return parseInt(challenge, 10);
      }
    }
    throw new NotAuthorizedError({ type: 'webhooks' });
  },
  create: async (data: WebhooksData | WebhooksDataDetail, _params?: RequestParams<any>) => {
    if (data.object === 'page') {
      let infoObj = {} as any;
      try {
        webhooksRepository.create(data);
        logger.info(`${LOGGER_NAME} Getting data`);
        if (data.entry[0].changes) {
          logger.info(`${LOGGER_NAME} Getting FB conversations with changes`, JSON.stringify(data));
          if (data.entry[0].changes[0].field === 'conversations') {
            infoObj.thread_id = data.entry[0].changes[0].value;
            conversationCallback(data);
          }
        }
        else if (data.entry[0].messaging) {
          logger.info(`${LOGGER_NAME} Getting FB conversations with messaging`, JSON.stringify(data));
          infoObj = await getThreadId(data);
          conversationCallbackWithMessaging(data, infoObj);
        }
      } catch (e) {
        cache.del(CACHE_NAME + infoObj.thread_id);
        logger.error(e);
        /*throw new EntityNotFoundError()*/
      }
      return 'EVENT_RECEIVED';
    } else {
      throw new EntityNotFoundError('Hook');
    }
  },
};

// @ts-ignore
export default webhooksService;
