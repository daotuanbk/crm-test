import {
  ensurePermission,
  validatePayload,
  removeEmpty,
  UserInputError,
} from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import { REFUNDABLE_STATUSES } from '@common/stages';
import * as yup from 'yup';
import {
  LeadRefund,
  leadRepository,
  calculateLeadTuition,
} from '@app/crm';
import _ from 'lodash';

const refundableStatusShortNames = _.flatMap(REFUNDABLE_STATUSES, 'shortName');

export const addRefund = async (req: any, res: any) => {
  try {
    // 0. Parse payload and params
    const { id } = req.params;
    const newLeadRefund: LeadRefund = removeEmpty(req.body);

    // 1. Authorize
    ensurePermission(req.authUser, PERMISSIONS.LEAD_REFUND.CREATE);

    // 2. Validate
    await validatePayload({
      amount: yup.number()
        .required('"amount" cant be empty')
        .positive('"amount" must be positive'),
      payday: yup.date()
        .required('"payday" cant be empty')
        .max(new Date(), '"payday" cant be in the furture'),
      note: yup.string()
        .nullable(true),
    }, newLeadRefund);

    const existedLead = await leadRepository.findById(id);

    if (!existedLead) {
      throw new UserInputError('Lead not found');
    }

    // 2. Handle bussiness logic

    const status = _.get(existedLead, 'v2Status');
    if (!refundableStatusShortNames.includes(status)) {
      throw new UserInputError('Lead "v2Status" not found in refundable status list');
    }

    const leadTuition = calculateLeadTuition(existedLead);

    if (leadTuition.totalRefund + newLeadRefund.amount > leadTuition.totalPayment) {
      throw new UserInputError('Refund amount is greater than all payment left');
    }

    const leadWithNewRefund = await leadRepository.pushRefund(id, newLeadRefund);
    const newLeadTuition = calculateLeadTuition(leadWithNewRefund); // Recalculate tuition
    const leadToReturn = await leadRepository.updateTuition(id, newLeadTuition);

    res.status(201).json(leadToReturn);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
