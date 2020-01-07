import { BadRequest } from '@feathersjs/errors';
export class CampaignInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'DefaultTaskInputError';
  }
}
