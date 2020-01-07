import { Aggregate, IsAuditable } from '@app/core';
import { FamilyMember, LeadOrder } from '@app/crm';
import { Reminder } from './Reminder';
import { Note } from './Note';
import { Appointment } from './Appointment';
import { Message } from './Message';
import { LeadProduct } from './LeadProduct';
import { LeadPayment } from './LeadPayment';
import { LeadRefund } from './LeadRefund';

export enum LeadStatuses {
  L0A = 'L0A',
  L0B = 'L0B',

  L1A = 'L1A',
  L1B = 'L1B',
  L1C = 'L1C',

  L2A = 'L2A',
  L2B = 'L2B',
  L2C = 'L2C',
  L2D = 'L2D',
  L2E = 'L2E',
  L2F = 'L2F',
  L2G = 'L2G',
  L2X = 'L2X',

  L3A = 'L3A',
  L3B = 'L3B',
  L3C = 'L3C',

  L4A = 'L4A',
  L4B = 'L4B',
  L4X = 'L4X',

  L5A = 'L5A',
  L5B = 'L5B',
  L5C = 'L5C',
}

export enum LeadChannels {
  Website = 'Website',
  Fanpage = 'Fanpage',
  Social = 'Social',
  Referral = 'Referral',
  Native = 'Native',
  Email = 'Email',
  EventOffline = 'Event offline',
  Other = 'Other',
  SelfCreated = 'Self created',
  Database = 'Database',
}

export enum LeadSources {
  None = 'None',
  Organic = 'Organic',
  Direct = 'Direct',
  Ads = 'Ads',
  Zalo = 'Zalo',
  Instagram = 'Instagram',
  Youtube = 'Youtube',
  Coccoc = 'Coccoc',
  Site = 'Site',
  EmailMarketing = 'Email marketing',
  EmailAds = 'Email ads',
  Hotline = 'Hotline',
  Referral = 'Referral',
  DirectSale = 'Direct sale',
  Resales = 'Resales',
  Telemarketing = 'Telemarketing',
  EventOffline = 'Event offline',
}

export enum LeadCampaigns {
  None = 'None',
  Search = 'Search',
  Display = 'Display',
  Inbox = 'Inbox',
  Comment = 'Comment',
  Conversion = 'Conversion',
  Lead = 'Lead',
  Mess = 'Mess',
  PostEngage = 'Post engage',
  Instream = 'Instream',
  Outstream = 'Outstream',
  Bumper6 = 'Bumper6',
  Bumper15 = 'Bumper15',
  Browserskin = 'Browserskin',
  Newtab = 'Newtab',
  Ads = 'Ads',
  PR = 'PR',
  StudentRefer = 'HV giới thiệu',
  ParentRefer = 'PH giới thiệu',
  SaleContact = "Sale's contact",
  CTW = 'CTW',
}

export enum LeadMediums {
  Keyword = 'Keyword',
  None = 'None',
  Banner = 'Banner',
  Landing = 'Landing',
  Form = 'Form',
  Chat = 'Chat',
  Video = 'Video',
  Cpm = 'Cpm',
  Cpc = 'Cpc',
  Cpd = 'Cpd',
  Funnel = 'Funnel',
  ColdData = 'Cold data',
}

export interface Lead extends Aggregate, IsAuditable {
  _id: string;
  centre: {
    _id: string;
    name: string;
    shortName: string;
  };
  sourceId: string;
  campaignId: string;
  owner: {
    id: string;
    fullName?: string;
    avatar?: string;
  };
  contact: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phone: string;
    email: string;
    fb: string;
    address: string;
  };
  customer: {
    _id: string; // Reference Contact table
    fullName: string; // Denormalize for search
    phoneNumber: string;
    email: string;
    family: FamilyMember[];
  };
  hasReminders: boolean;  // Data redundancy for better reminder sorting
  reminders: Reminder[];
  productOrder: {
    _id: string;
    comboId: string;
    comboName: string;
    courseCount: string;
    courses: [{
      name: string;
      shortName: string;
      tuitionBeforeDiscount: number;
      discountType: string;
      discountValue: number;
      stage: string;
      status: string;
      class: string;
      index: string;
    }]
  };
  tuition: {
    totalAfterDiscount: number;
    remaining: number;
    completePercent: number;
  };
  hasTuition: boolean; // Data redundancy for better sorting
  keepBadDepts: boolean;
  lastContactedAt: Date;
  currentStage: string;
  currentStatus: string;
  v2Status: LeadStatuses;
  lastUpdatedStageAt: Date;
  paymentDueAt: Date;
  recentTaskDueAt: Date;
  recentAppointmentDueAt: Date;
  new: boolean;
  messages: Message[];
  notes: Note[];
  appointments: Appointment[];
  hasAppointments: boolean; // Data redundancy for better sorting
  products: LeadProduct[];
  order: LeadOrder;
  payments: LeadPayment[];
  refunds: LeadRefund[];
  channel: LeadChannels;
  source: LeadSources;
  campaign: LeadCampaigns;
  medium: LeadMediums;
  content?: string;
}
