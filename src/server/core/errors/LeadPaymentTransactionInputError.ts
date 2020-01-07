import { BadRequest } from '@feathersjs/errors';
export class LeadPaymentTransactionInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'LeadPaymentTransactionInputError';
  }
}
