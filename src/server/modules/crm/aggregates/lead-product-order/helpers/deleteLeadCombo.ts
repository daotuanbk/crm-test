import { leadRepository, leadPaymentTransactionRepository } from '@app/crm';
import { get } from 'lodash';

export const deleteLeadCombo = async (leadId: string) => {
  const lead = await leadRepository.findById(leadId);

  if (get(lead, 'productOrder.comboId')) {

    const tuition = get(lead, 'productOrder.courses', []).reduce((sum: number, val: any) => {
      return sum + Number(val.tuitionBeforeDiscount);
    }, 0);

    let totalPayment = 0;
    const transactions = await leadPaymentTransactionRepository.find({ leadId: lead._id } as any);
    if (transactions) {
      totalPayment = transactions.reduce((sum: number, val: any) => sum + Number(val.amount), 0);
    }
    const remaining = Number(tuition) - Number(totalPayment);

    await leadRepository.update({
      id: lead._id,
      'tuition.totalAfterDiscount': tuition,
      'tuition.remaining': remaining,
      'productOrder.comboId': undefined,
      'productOrder.comboName': undefined,
    } as any);
  }
};
