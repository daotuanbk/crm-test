import {
  ensurePermission,
  validatePayload,
  removeEmpty,
  UserInputError,
} from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import { PAYABLE_STATUSES } from '@common/stages';
import * as yup from 'yup';
import {
  LeadPayment,
  leadRepository,
  calculateLeadTuition,
  LeadStatuses,
} from '@app/crm';
import _ from 'lodash';

const payableStatusShortNames = _.flatMap(PAYABLE_STATUSES, 'shortName');

export const addPayment = async (req: any, res: any) => {
  try {
    // 0. Parse payload and params
    const { id } = req.params;
    const newLeadPayment: LeadPayment = removeEmpty(req.body);

    // 1. Authorize
    ensurePermission(req.authUser, PERMISSIONS.LEAD_PAYMENT.CREATE);

    // 2. Validate
    await validatePayload({
      amount: yup.number()
        .required('"amount" cant be empty')
        .positive('"amount" must be positive'),
      payday: yup.date()
        .required('"payday" cant be empty')
        .max(new Date(), '"payday" cant be the day in the furture'),
      note: yup.string()
        .nullable(true),
    }, newLeadPayment);

    const existedLead = await leadRepository.findById(id);

    if (!existedLead) {
      throw new UserInputError('Lead not found');
    }

    // 2. Handle bussiness logic
    const status = _.get(existedLead, 'v2Status');
    if (!payableStatusShortNames.includes(status)) {
      throw new UserInputError('Lead "v2Status" not found in payable status list');
    }

    const leadTuition = calculateLeadTuition(existedLead);
    if (newLeadPayment.amount > leadTuition.remaining) {
      throw new UserInputError('The "amount" is greater than the remaining customer has to pay');
    }

    const leadWithNewPayment = await leadRepository.pushPayment(id, newLeadPayment);
    const newLeadTuition = calculateLeadTuition(leadWithNewPayment); // Recalculate tuition
    await leadRepository.updateTuition(id, newLeadTuition);

    // 4. If comletePercent < 100% => auto update to L5B
    let updateV2Status = existedLead.v2Status;
    if (newLeadTuition.completePercent < 100) {
      updateV2Status = LeadStatuses.L5B;
    } else if (newLeadTuition.completePercent >= 100) {
      updateV2Status = LeadStatuses.L5C;
    }
    const leadToReturn = await leadRepository.update({
      id,
      v2Status: updateV2Status,
    });

    res.status(201).json(leadToReturn);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
