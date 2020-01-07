import { FindResult, RequestParams, Service } from '@app/core';
import {
  LeadAttachment,
  FindLeadAttachmentQuery,
  LeadAttachmentRepository,
} from '@app/crm';
import { Application } from '@feathersjs/express';

export interface LeadAttachmentService extends Service<LeadAttachment, FindLeadAttachmentQuery, LeadAttachmentRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<LeadAttachment>, params: RequestParams<LeadAttachmentRepository>) => Promise<{}>;
  getByFbConversationId: (fbConversationId: string) => Promise<LeadAttachment>;
  getByLeadOrContactId: (params: RequestParams<LeadAttachmentRepository> & { query: FindLeadAttachmentQuery }) => Promise<FindResult<LeadAttachment>>;
}
