import { Contact, Relations } from '@app/crm';

export interface EnrollmentMessagePayload {
  leadId: string; // Product enrollment item ID
  productItemId: string;
  productEnrollmentItemId: string;
  customer: Contact;
  candidate: Contact;
  relation: Relations;
  cancelled: boolean;
  requestTime: string;
  lmsCourseId: string;
  lmsClassId: string;
}
