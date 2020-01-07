import mongoose from 'mongoose';
import { addAuditableSchema, addDeletableSchema } from '@app/core';

const ContactSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  contactBasicInfo: {
    firstName: String,
    lastName: String,
    fullName: String,
    phone: String,
    email: String,
    fb: String,
    address: String,
    gender: String,
    dob: Date,
    avatar: String,
    userType: {
      type: String,
      default: 'student',
    },
    job: String,
  },
  contactRelations: [{
    index: String,
    userType: String,
    relation: String,
    description: String,
    fullName: String,
    email: String,
    phone: String,
    dob: Date,
    job: String,
    social: String,
  }],
  schoolInfo: {
    schoolName: String,
    majorGrade: String,
  },
  fbConversationId: {
    type: String,
  },
  lastContactedAt: Date,
  isQualified: {
    type: Boolean,
    default: false,
  },
  isCustomerHasLead: {
    type: Boolean,
    default: false,
  },
  prospectingListId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProspectingList',
    required: true,
  },
  sourceId: Number,
  rootContactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RootContact',
  },
  refContactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  ownerId: {
    type: String,
    ref: 'User',
  },
  centre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Centre',
  },
  lastMessageAt: {
    type: Number,
  },
  assignedAt: {
    type: Number,
  },
  lastMessageInfo: {
    isRead: {
      type: Boolean,
      default: true,
    },
    email: {
      type: Number,
      default: 0,
    },
    message: {
      type: Number,
      default: 0,
    },
  },
  new: {
    type: Boolean,
  },
  currentStage: {
    type: String,
    default: 'L1',
  },
  currentStatus: String,
  lastUpdatedStageAt: Date,
  lastUpdatedStatusAt: Date,
  assignFromHO: Boolean,
  oldCustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
  },
})));

export const ContactModel = mongoose.model('Contact', ContactSchema);
