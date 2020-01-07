import { Gender } from '@app/core';
import { Relations } from '@app/crm';

export interface AddFamilyMemberPayload {
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
  relation: Relations;
}
