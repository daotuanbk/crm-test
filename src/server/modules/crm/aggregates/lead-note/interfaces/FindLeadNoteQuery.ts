import { FindQuery } from '@app/core';

export interface FindLeadNoteQuery extends FindQuery {
  leadId: string;
}
